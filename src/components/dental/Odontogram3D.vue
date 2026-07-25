<template>
  <div class="three-jaw-container" ref="container">
    <div v-if="hoveredInfo" class="hover-tag" :style="tagStyle">
      <span class="tag-id">{{ hoveredInfo.id }}</span>
      <span class="tag-name">{{ hoveredInfo.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const props = defineProps({
  teeth: { type: Array, required: true },
  selectedTooth: { type: Object, default: null },
  xrayMode: { type: Boolean, default: false },
  showGums: { type: Boolean, default: true },
  showNumbers: { type: Boolean, default: false },
})

const emit = defineEmits(['select-tooth'])

const container = ref(null)
const ready = ref(false)
const hoveredInfo = ref(null)
const tagStyle = ref({ left: '50%', top: '50%' })

let scene, camera, renderer, controls, animId
let raycaster, mouse
let clickableMeshes = []
let upperJawGroup = new THREE.Group()
let lowerJawGroup = new THREE.Group()
let jawBoneGroup = new THREE.Group()
let toothMap = new Map()
let hoveredGroup = null
let originalMaterials = new Map()
let xrayLights = []
let numberLabels = []
let animTime = 0

const TOOTH_NAMES = {
  1: 'قاطع مركزي', 2: 'قاطع جانبي', 3: 'ناب', 4: 'ضاحك أول', 5: 'ضاحك ثاني', 6: 'طاحن أول', 7: 'طاحن ثاني', 8: 'ضرس العقل',
}

const STATUS_COLORS = {
  healthy: null,
  caries: 0xA0522D,
  filled: 0x5B9BD5,
  crown: 0xDAA520,
  extracted: 0x444444,
  implant: 0xCCCCCC,
  root_canal: 0xEC4899,
  fracture: 0xD2691E,
  bridge: 0x7B68EE,
  extraction_indicated: 0xCC3333,
  not_erupted: 0x888888,
}

const S = 0.1

const TOOTH_MESIODISTAL = {
  max: { 1: 8.6, 2: 6.6, 3: 7.6, 4: 7.2, 5: 6.8, 6: 10.1, 7: 9.6, 8: 8.5 },
  mand: { 1: 5.4, 2: 6.1, 3: 7.0, 4: 7.0, 5: 6.8, 6: 10.0, 7: 9.8, 8: 8.5 },
}
const TOOTH_HEIGHT = {
  max: { 1: 12, 2: 13, 3: 17, 4: 8.5, 5: 8.5, 6: 7.5, 7: 7.5, 8: 7 },
  mand: { 1: 10.5, 2: 11.5, 3: 15, 4: 8.5, 5: 8.5, 6: 7.5, 7: 7.5, 8: 7 },
}
const TOOTH_BUCCAL_LINGUAL = {
  max: { 1: 7.0, 2: 6.0, 3: 7.5, 4: 9.0, 5: 9.0, 6: 10.0, 7: 9.8, 8: 9.3 },
  mand: { 1: 5.5, 2: 6.0, 3: 6.5, 4: 7.0, 5: 7.0, 6: 9.5, 7: 9.8, 8: 9.0 },
}

function computeArch(isUpper) {
  const result = []
  const halfW = isUpper ? 32 : 29
  const depth = isUpper ? 48 : 44
  for (let pos = 1; pos <= 8; pos++) {
    const t = (pos - 1) / 7
    const angle = t * Math.PI * 0.48
    const x = Math.sin(angle) * halfW * S
    const z = (1 - Math.cos(angle)) * depth * S
    const tangent = angle + Math.PI * 0.5
    let tilt = 0
    if (pos <= 2) tilt = -5
    else if (pos === 3) tilt = 0
    else if (pos <= 5) tilt = 3
    else tilt = 6
    result.push({ pos, x, z, tangent, tilt })
  }
  return result
}

const MAX_ARCH = computeArch(true)
const MAND_ARCH = computeArch(false)
const JAW_GAP = 2.0

function toothKey(pos, isUpper) {
  return `${isUpper ? 'U' : 'L'}${pos}`
}

const toothGeometryCache = new THREE.Group()
const crownGeos = new Map()

const ENAMEL_COLOR = 0xFDF8F0
const CEMENT_COLOR = 0xE8D8B8
const DENTIN_COLOR = 0xF5E8D0

const enamelMat = () => new THREE.MeshStandardMaterial({
  color: ENAMEL_COLOR,
  roughness: 0.15,
  metalness: 0.04,
  clearcoat: 0.3,
  clearcoatRoughness: 0.1,
})

const rootMat = () => new THREE.MeshStandardMaterial({
  color: CEMENT_COLOR,
  roughness: 0.45,
  metalness: 0.01,
})

function roundedBoxGeo(w, h, d, radius, segs) {
  const shape = new THREE.Shape()
  const hw = w / 2 - radius
  const hh = h / 2 - radius
  shape.moveTo(-hw, -h / 2)
  shape.lineTo(hw, -h / 2)
  shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -hh)
  shape.lineTo(w / 2, hh)
  shape.quadraticCurveTo(w / 2, h / 2, hw, h / 2)
  shape.lineTo(-hw, h / 2)
  shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, hh)
  shape.lineTo(-w / 2, -hh)
  shape.quadraticCurveTo(-w / 2, -h / 2, -hw, -h / 2)

  const extrudeSettings = {
    depth: d,
    bevelEnabled: true,
    bevelThickness: radius * 0.5,
    bevelSize: radius * 0.5,
    bevelSegments: segs || 3,
  }
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  geo.translate(0, 0, -d / 2)
  return geo
}

function createIncisorGeo(pos, isUpper) {
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 7
  const h = (isUpper ? TOOTH_HEIGHT.max : TOOTH_HEIGHT.mand)[pos] || 12
  const bl = (isUpper ? TOOTH_BUCCAL_LINGUAL.max : TOOTH_BUCCAL_LINGUAL.mand)[pos] || 7
  const w = md * S
  const th = h * S * 0.55
  const d = bl * S * 0.55
  const isCentral = pos === 1

  const shape = new THREE.Shape()
  const hw = w / 2
  shape.moveTo(-hw * 0.7, 0)
  shape.bezierCurveTo(-hw * 0.9, th * 0.2, -hw, th * 0.5, -hw * 0.85, th * 0.75)
  shape.bezierCurveTo(-hw * 0.7, th * 0.92, -hw * 0.35, th, 0, th)
  shape.bezierCurveTo(hw * 0.35, th, hw * 0.7, th * 0.92, hw * 0.85, th * 0.75)
  shape.bezierCurveTo(hw, th * 0.5, hw * 0.9, th * 0.2, hw * 0.7, 0)
  shape.bezierCurveTo(hw * 0.5, -th * 0.05, hw * 0.3, -th * 0.02, 0, 0)
  shape.bezierCurveTo(-hw * 0.3, -th * 0.02, -hw * 0.5, -th * 0.05, -hw * 0.7, 0)

  const ext = {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.015,
    bevelSize: 0.02,
    bevelSegments: 3,
    curveSegments: 12,
  }
  const geo = new THREE.ExtrudeGeometry(shape, ext)
  geo.translate(0, 0, -d / 2)
  geo.computeVertexNormals()
  return geo
}

function createCanineGeo(pos, isUpper) {
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 7.6
  const h = (isUpper ? TOOTH_HEIGHT.max : TOOTH_HEIGHT.mand)[pos] || 17
  const bl = (isUpper ? TOOTH_BUCCAL_LINGUAL.max : TOOTH_BUCCAL_LINGUAL.mand)[pos] || 7.5
  const w = md * S
  const th = h * S * 0.6
  const d = bl * S * 0.5

  const shape = new THREE.Shape()
  const hw = w / 2
  shape.moveTo(-hw * 0.6, 0)
  shape.bezierCurveTo(-hw * 0.8, th * 0.15, -hw * 0.85, th * 0.4, -hw * 0.6, th * 0.65)
  shape.bezierCurveTo(-hw * 0.4, th * 0.82, -hw * 0.15, th * 0.95, 0, th * 1.02)
  shape.bezierCurveTo(hw * 0.15, th * 0.95, hw * 0.4, th * 0.82, hw * 0.6, th * 0.65)
  shape.bezierCurveTo(hw * 0.85, th * 0.4, hw * 0.8, th * 0.15, hw * 0.6, 0)
  shape.bezierCurveTo(hw * 0.35, -th * 0.03, hw * 0.15, -th * 0.01, 0, 0)
  shape.bezierCurveTo(-hw * 0.15, -th * 0.01, -hw * 0.35, -th * 0.03, -hw * 0.6, 0)

  const ext = {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.022,
    bevelSegments: 3,
    curveSegments: 12,
  }
  const geo = new THREE.ExtrudeGeometry(shape, ext)
  geo.translate(0, 0, -d / 2)
  geo.computeVertexNormals()
  return geo
}

function createPremolarGeo(pos, isUpper) {
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 7
  const h = (isUpper ? TOOTH_HEIGHT.max : TOOTH_HEIGHT.mand)[pos] || 8.5
  const bl = (isUpper ? TOOTH_BUCCAL_LINGUAL.max : TOOTH_BUCCAL_LINGUAL.mand)[pos] || 9
  const w = md * S
  const th = h * S * 0.4
  const d = bl * S * 0.5

  const shape = new THREE.Shape()
  const hw = w / 2
  shape.moveTo(-hw * 0.65, 0)
  shape.bezierCurveTo(-hw * 0.85, th * 0.2, -hw * 0.9, th * 0.5, -hw * 0.7, th * 0.75)
  shape.bezierCurveTo(-hw * 0.5, th * 0.9, -hw * 0.2, th * 0.98, 0, th)
  shape.bezierCurveTo(hw * 0.2, th * 0.98, hw * 0.5, th * 0.9, hw * 0.7, th * 0.75)
  shape.bezierCurveTo(hw * 0.9, th * 0.5, hw * 0.85, th * 0.2, hw * 0.65, 0)
  shape.bezierCurveTo(hw * 0.4, -th * 0.03, hw * 0.2, -th * 0.01, 0, 0)
  shape.bezierCurveTo(-hw * 0.2, -th * 0.01, -hw * 0.4, -th * 0.03, -hw * 0.65, 0)

  const ext = {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 12,
  }
  const geo = new THREE.ExtrudeGeometry(shape, ext)
  geo.translate(0, 0, -d / 2)
  geo.computeVertexNormals()
  return geo
}

function createMolarGeo(pos, isUpper) {
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 10
  const h = (isUpper ? TOOTH_HEIGHT.max : TOOTH_HEIGHT.mand)[pos] || 7.5
  const bl = (isUpper ? TOOTH_BUCCAL_LINGUAL.max : TOOTH_BUCCAL_LINGUAL.mand)[pos] || 10
  const w = md * S
  const th = h * S * 0.35
  const d = bl * S * 0.5

  const shape = new THREE.Shape()
  const hw = w / 2
  shape.moveTo(-hw * 0.7, 0)
  shape.bezierCurveTo(-hw * 0.9, th * 0.25, -hw * 0.95, th * 0.55, -hw * 0.75, th * 0.8)
  shape.bezierCurveTo(-hw * 0.55, th * 0.93, -hw * 0.25, th * 1.0, 0, th)
  shape.bezierCurveTo(hw * 0.25, th * 1.0, hw * 0.55, th * 0.93, hw * 0.75, th * 0.8)
  shape.bezierCurveTo(hw * 0.95, th * 0.55, hw * 0.9, th * 0.25, hw * 0.7, 0)
  shape.bezierCurveTo(hw * 0.45, -th * 0.04, hw * 0.2, -th * 0.01, 0, 0)
  shape.bezierCurveTo(-hw * 0.2, -th * 0.01, -hw * 0.45, -th * 0.04, -hw * 0.7, 0)

  const ext = {
    depth: d,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 12,
  }
  const geo = new THREE.ExtrudeGeometry(shape, ext)
  geo.translate(0, 0, -d / 2)
  geo.computeVertexNormals()
  return geo
}

function createOcclusalSurface(pos, isUpper) {
  const group = new THREE.Group()
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 10
  const bl = (isUpper ? TOOTH_BUCCAL_LINGUAL.max : TOOTH_BUCCAL_LINGUAL.mand)[pos] || 9
  const w = md * S
  const d = bl * S * 0.5

  if (pos <= 3) return group

  const cuspPositions = pos >= 6
    ? [
      { x: -w * 0.25, z: -d * 0.25, h: 0.06 },
      { x: w * 0.25, z: -d * 0.25, h: 0.05 },
      { x: -w * 0.25, z: d * 0.25, h: 0.055 },
      { x: w * 0.25, z: d * 0.25, h: 0.045 },
    ]
    : [
      { x: -w * 0.22, z: -d * 0.2, h: 0.055 },
      { x: w * 0.22, z: d * 0.2, h: 0.05 },
    ]

  const cuspMat = enamelMat()

  for (const cp of cuspPositions) {
    const cuspGeo = new THREE.SphereGeometry(0.06, 8, 6)
    cuspGeo.scale(1, 0.5, 1)
    const cusp = new THREE.Mesh(cuspGeo, cuspMat)
    cusp.position.set(cp.x, 0.03, cp.z)
    cusp.castShadow = true
    group.add(cusp)
  }

  const fissureMat = new THREE.MeshStandardMaterial({
    color: 0xD4C8B0,
    roughness: 0.7,
    metalness: 0.0,
  })

  if (pos >= 6) {
    const fPts = [
      new THREE.Vector3(-w * 0.3, 0.01, 0),
      new THREE.Vector3(0, 0.01, 0),
      new THREE.Vector3(w * 0.3, 0.01, 0),
    ]
    const fCurve = new THREE.CatmullRomCurve3(fPts)
    const fGeo = new THREE.TubeGeometry(fCurve, 8, 0.012, 4, false)
    group.add(new THREE.Mesh(fGeo, fissureMat))

    const fPts2 = [
      new THREE.Vector3(0, 0.01, -d * 0.3),
      new THREE.Vector3(0, 0.01, 0),
      new THREE.Vector3(0, 0.01, d * 0.3),
    ]
    const fCurve2 = new THREE.CatmullRomCurve3(fPts2)
    const fGeo2 = new THREE.TubeGeometry(fCurve2, 8, 0.012, 4, false)
    group.add(new THREE.Mesh(fGeo2, fissureMat))
  } else {
    const fPts = [
      new THREE.Vector3(-w * 0.2, 0.01, 0),
      new THREE.Vector3(0, 0.01, 0),
      new THREE.Vector3(w * 0.2, 0.01, 0),
    ]
    const fCurve = new THREE.CatmullRomCurve3(fPts)
    const fGeo = new THREE.TubeGeometry(fCurve, 6, 0.01, 4, false)
    group.add(new THREE.Mesh(fGeo, fissureMat))
  }

  return group
}

function createRoot(pos, isUpper) {
  const group = new THREE.Group()
  const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[pos] || 7
  const rootLen = (isUpper ? TOOTH_HEIGHT.max : TOOTH_HEIGHT.mand)[pos] * S * 0.55
  const rootR = md * S * 0.1

  let numRoots = 1
  let spreadX = 0
  let spreadZ = 0
  if (pos >= 6) {
    numRoots = isUpper ? 3 : 2
    spreadX = md * S * 0.12
    spreadZ = md * S * 0.08
  } else if (pos === 3) {
    numRoots = 1
    spreadX = 0
  }

  const rMat = rootMat()

  if (numRoots === 1) {
    const pts = []
    pts.push(new THREE.Vector2(0, 0))
    pts.push(new THREE.Vector2(rootR * 1.1, rootLen * 0.1))
    pts.push(new THREE.Vector2(rootR * 1.2, rootLen * 0.25))
    pts.push(new THREE.Vector2(rootR * 1.15, rootLen * 0.45))
    pts.push(new THREE.Vector2(rootR * 1.0, rootLen * 0.65))
    pts.push(new THREE.Vector2(rootR * 0.7, rootLen * 0.82))
    pts.push(new THREE.Vector2(rootR * 0.35, rootLen * 0.93))
    pts.push(new THREE.Vector2(rootR * 0.1, rootLen * 0.98))
    pts.push(new THREE.Vector2(0, rootLen))
    const rGeo = new THREE.LatheGeometry(pts, 12)
    const root = new THREE.Mesh(rGeo, rMat)
    root.castShadow = true
    group.add(root)
  } else {
    const positions = []
    if (numRoots === 2) {
      positions.push({ x: -spreadX, z: -spreadZ })
      positions.push({ x: spreadX, z: spreadZ })
    } else {
      positions.push({ x: -spreadX, z: 0 })
      positions.push({ x: 0, z: -spreadZ * 1.5 })
      positions.push({ x: spreadX, z: 0 })
    }
    for (const p of positions) {
      const pts = []
      pts.push(new THREE.Vector2(0, 0))
      pts.push(new THREE.Vector2(rootR * 0.9, rootLen * 0.12))
      pts.push(new THREE.Vector2(rootR, rootLen * 0.3))
      pts.push(new THREE.Vector2(rootR * 0.9, rootLen * 0.55))
      pts.push(new THREE.Vector2(rootR * 0.6, rootLen * 0.78))
      pts.push(new THREE.Vector2(rootR * 0.25, rootLen * 0.92))
      pts.push(new THREE.Vector2(0, rootLen))
      const rGeo = new THREE.LatheGeometry(pts, 8)
      const root = new THREE.Mesh(rGeo, rMat)
      root.position.set(p.x, 0, p.z)
      root.castShadow = true
      group.add(root)
    }

    const furcationPts = []
    const fY = rootLen * 0.12
    furcationPts.push(new THREE.Vector3(-spreadX * 1.2, fY, -spreadZ * 1.2))
    furcationPts.push(new THREE.Vector3(0, fY * 0.8, 0))
    furcationPts.push(new THREE.Vector3(spreadX * 1.2, fY, spreadZ * 1.2))
    const fCurve = new THREE.CatmullRomCurve3(furcationPts)
    const fGeo = new THREE.TubeGeometry(fCurve, 6, rootR * 0.8, 6, false)
    const fMesh = new THREE.Mesh(fGeo, rMat.clone())
    fMesh.material.color.setHex(CEMENT_COLOR)
    fMesh.material.roughness = 0.5
    fMesh.castShadow = true
    group.add(fMesh)
  }

  const cervicalMat = new THREE.MeshStandardMaterial({
    color: 0xF0E4C8,
    roughness: 0.35,
    metalness: 0.02,
  })
  const cervGeo = new THREE.TorusGeometry(rootR * 1.15, 0.015, 6, 16)
  const cerv = new THREE.Mesh(cervGeo, cervicalMat)
  cerv.rotation.x = Math.PI / 2
  cerv.position.y = 0.005
  group.add(cerv)

  return group
}

function getToothGeo(pos, isUpper) {
  const key = toothKey(pos, isUpper)
  if (crownGeos.has(key)) return crownGeos.get(key)

  let geo
  if (pos <= 2) {
    geo = createIncisorGeo(pos, isUpper)
  } else if (pos === 3) {
    geo = createCanineGeo(pos, isUpper)
  } else if (pos <= 5) {
    geo = createPremolarGeo(pos, isUpper)
  } else {
    geo = createMolarGeo(pos, isUpper)
  }

  crownGeos.set(key, geo)
  return geo
}

function makeToothMaterial(isExtracted, status) {
  if (isExtracted) {
    return new THREE.MeshStandardMaterial({
      color: 0x222222,
      roughness: 0.95,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }

  const statusColor = STATUS_COLORS[status]
  if (statusColor) {
    return new THREE.MeshStandardMaterial({
      color: statusColor,
      roughness: 0.35,
      metalness: 0.08,
    })
  }

  return enamelMat()
}

function createMandible() {
  const group = new THREE.Group()
  const archData = MAND_ARCH
  const lastX = archData[7].x
  const lastZ = archData[7].z

  const bonePoints = []
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const angle = t * Math.PI * 0.52
    const x = Math.sin(angle) * (lastX + 0.3)
    const z = (1 - Math.cos(angle)) * (lastZ + 0.3)
    const y = -(JAW_GAP * 0.5 + 0.6)
    bonePoints.push(new THREE.Vector3(x, y, z))
  }
  const curve = new THREE.CatmullRomCurve3(bonePoints)
  const boneGeo = new THREE.TubeGeometry(curve, 100, 2.2, 12, false)
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xEDE0D0,
    roughness: 0.7,
    metalness: 0.02,
    transparent: true,
    opacity: 0.72,
  })
  const boneMesh = new THREE.Mesh(boneGeo, boneMat)
  boneMesh.castShadow = true
  boneMesh.receiveShadow = true
  group.add(boneMesh)

  for (const side of [-1, 1]) {
    const ramusPts = []
    for (let i = 0; i <= 30; i++) {
      const t = i / 30
      const x = side * (lastX + 0.3 + t * 0.5)
      const z = lastZ + 0.3 + t * 2.5
      const y = -(JAW_GAP * 0.5 + 0.6) - t * 4.5 + t * t * 0.5
      ramusPts.push(new THREE.Vector3(x, y, z))
    }
    const rCurve = new THREE.CatmullRomCurve3(ramusPts)
    const rGeo = new THREE.TubeGeometry(rCurve, 20, 1.5, 10, false)
    const rMat = new THREE.MeshStandardMaterial({
      color: 0xE8D8C4,
      roughness: 0.72,
      metalness: 0.02,
      transparent: true,
      opacity: 0.68,
    })
    const rMesh = new THREE.Mesh(rGeo, rMat)
    rMesh.castShadow = true
    group.add(rMesh)

    const condylePts = []
    const cx = side * (lastX + 0.3 + 0.5)
    const cz = lastZ + 0.3 + 2.5
    const cy = -(JAW_GAP * 0.5 + 0.6) - 4.5 + 0.5
    for (let i = 0; i <= 16; i++) {
      const a = (i / 16) * Math.PI * 2
      const r = 0.7
      condylePts.push(new THREE.Vector3(
        cx + Math.cos(a) * r * 0.5,
        cy + Math.sin(a) * r,
        cz + 1.2
      ))
    }
    const condyleCurve = new THREE.CatmullRomCurve3(condylePts, true)
    const condyleGeo = new THREE.TubeGeometry(condyleCurve, 16, 0.5, 8, true)
    const condyleMat = new THREE.MeshStandardMaterial({
      color: 0xF0E4D4,
      roughness: 0.5,
      metalness: 0.03,
      transparent: true,
      opacity: 0.75,
    })
    const condyleMesh = new THREE.Mesh(condyleGeo, condyleMat)
    condyleMesh.castShadow = true
    group.add(condyleMesh)

    const chinPts = []
    for (let i = 0; i <= 12; i++) {
      const t = i / 12
      const x = side * t * 3.5
      const z = -0.5 - t * 1.5
      const y = -(JAW_GAP * 0.5 + 0.6) + Math.sin(t * Math.PI) * 0.8
      chinPts.push(new THREE.Vector3(x, y, z))
    }
    if (side === 1) {
      const chinCurve = new THREE.CatmullRomCurve3(chinPts)
      const chinGeo = new THREE.TubeGeometry(chinCurve, 12, 1.2, 8, false)
      const chinMat = new THREE.MeshStandardMaterial({
        color: 0xEDE0D0,
        roughness: 0.7,
        metalness: 0.02,
        transparent: true,
        opacity: 0.7,
      })
      const chinMesh = new THREE.Mesh(chinGeo, chinMat)
      chinMesh.castShadow = true
      group.add(chinMesh)
    }
  }

  const mentalForamenMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.9,
  })
  for (const side of [-1, 1]) {
    const fGeo = new THREE.CircleGeometry(0.2, 16)
    const fMesh = new THREE.Mesh(fGeo, mentalForamenMat)
    fMesh.position.set(side * 4.0, -(JAW_GAP * 0.5 + 0.6), 3.5)
    fMesh.lookAt(fMesh.position.clone().add(new THREE.Vector3(0, 0, 1)))
    group.add(fMesh)
  }

  return group
}

function createMaxilla() {
  const group = new THREE.Group()
  const archData = MAX_ARCH
  const lastX = archData[7].x
  const lastZ = archData[7].z

  const bonePoints = []
  for (let i = 0; i <= 100; i++) {
    const t = i / 100
    const angle = t * Math.PI * 0.52
    const x = Math.sin(angle) * (lastX + 0.3)
    const z = (1 - Math.cos(angle)) * (lastZ + 0.3)
    const y = JAW_GAP * 0.5 + 0.6
    bonePoints.push(new THREE.Vector3(x, y, z))
  }
  const curve = new THREE.CatmullRomCurve3(bonePoints)
  const boneGeo = new THREE.TubeGeometry(curve, 100, 2.0, 12, false)
  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xF5E6D3,
    roughness: 0.7,
    metalness: 0.02,
    transparent: true,
    opacity: 0.7,
  })
  const boneMesh = new THREE.Mesh(boneGeo, boneMat)
  boneMesh.castShadow = true
  boneMesh.receiveShadow = true
  group.add(boneMesh)

  const palatPts = []
  for (let i = 0; i <= 30; i++) {
    const t = i / 30
    const angle = t * Math.PI * 0.35
    const x = Math.sin(angle) * (lastX * 0.6)
    const z = (1 - Math.cos(angle)) * (lastZ * 0.7)
    const y = JAW_GAP * 0.5 + 0.6 + 0.3
    palatPts.push(new THREE.Vector3(x, y, z))
  }
  const palatCurve = new THREE.CatmullRomCurve3(palatPts)
  const palatGeo = new THREE.TubeGeometry(palatCurve, 30, 1.5, 8, false)
  const palatMat = new THREE.MeshStandardMaterial({
    color: 0xF0E0CC,
    roughness: 0.65,
    metalness: 0.02,
    transparent: true,
    opacity: 0.55,
  })
  const palatMesh = new THREE.Mesh(palatGeo, palatMat)
  palatMesh.castShadow = true
  group.add(palatMesh)

  for (const side of [-1, 1]) {
    const zygoPts = []
    for (let i = 0; i <= 16; i++) {
      const t = i / 16
      const x = side * (lastX + 0.3 + t * 2.5)
      const z = lastZ * 0.5 + t * 1.5
      const y = JAW_GAP * 0.5 + 0.6 - t * 0.8
      zygoPts.push(new THREE.Vector3(x, y, z))
    }
    const zCurve = new THREE.CatmullRomCurve3(zygoPts)
    const zGeo = new THREE.TubeGeometry(zCurve, 12, 0.8, 8, false)
    const zMat = new THREE.MeshStandardMaterial({
      color: 0xF5E6D3,
      roughness: 0.72,
      metalness: 0.02,
      transparent: true,
      opacity: 0.6,
    })
    const zMesh = new THREE.Mesh(zGeo, zMat)
    zMesh.castShadow = true
    group.add(zMesh)
  }

  return group
}

function createGingiva(isUpper) {
  const group = new THREE.Group()
  const archData = isUpper ? MAX_ARCH : MAND_ARCH
  const y = isUpper ? JAW_GAP * 0.5 : -(JAW_GAP * 0.5)
  const gumColor = isUpper ? 0xD4849A : 0xCC7090

  for (const entry of archData) {
    const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[entry.pos] || 7
    const outerR = md * S * 0.8
    const innerR = md * S * 0.35
    const gumH = md * S * 0.25

    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(innerR, gumH * 0.3),
      new THREE.Vector2(outerR, gumH * 0.6),
      new THREE.Vector2(outerR * 1.1, gumH * 0.8),
      new THREE.Vector2(outerR * 0.95, gumH),
      new THREE.Vector2(outerR * 0.6, gumH * 0.9),
      new THREE.Vector2(innerR * 0.8, gumH * 0.5),
      new THREE.Vector2(0, gumH * 0.2),
    ]
    const latheGeo = new THREE.LatheGeometry(pts, 12)
    const latheMat = new THREE.MeshStandardMaterial({
      color: gumColor,
      roughness: 0.55,
      metalness: 0.02,
      transparent: true,
      opacity: 0.78,
    })
    const lathe = new THREE.Mesh(latheGeo, latheMat)
    lathe.position.set(entry.x, y + (isUpper ? -0.1 : 0.1), entry.z)
    lathe.rotation.x = isUpper ? 0 : Math.PI
    lathe.castShadow = true
    group.add(lathe)
  }

  const outerPts = []
  const innerPts = []
  const lastEntry = archData[7]
  for (let i = 0; i <= 80; i++) {
    const t = i / 80
    const angle = t * Math.PI * 0.52
    const outerX = Math.sin(angle) * (lastEntry.x + 1.2)
    const outerZ = (1 - Math.cos(angle)) * (lastEntry.z + 0.8)
    const innerX = Math.sin(angle) * (lastEntry.x - 1.5)
    const innerZ = (1 - Math.cos(angle)) * (lastEntry.z - 1.0)
    const gy = y + (isUpper ? -0.15 : 0.15)
    outerPts.push(new THREE.Vector3(outerX, gy, outerZ))
    innerPts.push(new THREE.Vector3(innerX, gy, innerZ))
  }

  const outerCurve = new THREE.CatmullRomCurve3(outerPts)
  const innerCurve = new THREE.CatmullRomCurve3(innerPts)
  const oGeo = new THREE.TubeGeometry(outerCurve, 60, 0.3, 8, false)
  const iGeo = new THREE.TubeGeometry(innerCurve, 60, 0.25, 8, false)
  const gMat = new THREE.MeshStandardMaterial({
    color: gumColor,
    roughness: 0.55,
    metalness: 0.02,
    transparent: true,
    opacity: 0.72,
  })
  group.add(new THREE.Mesh(oGeo, gMat.clone()))
  group.add(new THREE.Mesh(iGeo, gMat.clone()))

  return group
}

function applyStatusColor(group, status) {
  if (!group || status === 'healthy' || !STATUS_COLORS[status]) return
  const color = STATUS_COLORS[status]
  group.traverse((child) => {
    if (child.isMesh) {
      if (!originalMaterials.has(child.uuid)) {
        originalMaterials.set(child.uuid, child.material.clone())
      }
      child.material = child.material.clone()
      child.material.color.setHex(color)
      child.material.roughness = 0.45
      child.material.metalness = 0.12
    }
  })
}

function applyXrayMode(enabled) {
  scene.background = new THREE.Color(enabled ? 0x040810 : 0x080C14)
  scene.fog = new THREE.Fog(enabled ? 0x040810 : 0x080C14, 18, 35)
  xrayLights.forEach(l => { l.intensity = enabled ? 2.5 : 0 })
  clickableMeshes.forEach(mesh => {
    const data = toothMap.get(mesh)
    if (data && data.status !== 'extracted') {
      mesh.material = mesh.material.clone()
      mesh.material.transparent = enabled
      mesh.material.opacity = enabled ? 0.22 : 1.0
      mesh.material.roughness = enabled ? 0.05 : 0.22
      mesh.material.emissive = new THREE.Color(enabled ? 0x003366 : 0x000000)
      mesh.material.emissiveIntensity = enabled ? 0.5 : 0
    }
  })
  jawBoneGroup.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone()
      child.material.transparent = true
      child.material.opacity = enabled ? 0.1 : (child.userData?.origOpacity || 0.7)
      child.material.emissive = new THREE.Color(enabled ? 0x001133 : 0x000000)
      child.material.emissiveIntensity = enabled ? 0.3 : 0
    }
  })
}

function buildToothNumbers() {
  numberLabels.forEach(n => scene.remove(n))
  numberLabels = []
  if (!props.showNumbers) return
  for (const toothData of props.teeth) {
    const isUpper = toothData.quadrant <= 2
    const isRight = toothData.quadrant === 1 || toothData.quadrant === 4
    const arch = isUpper ? MAX_ARCH : MAND_ARCH
    const entry = arch.find(a => a.pos === toothData.position) || arch[0]
    const x = entry.x * (isRight ? 1 : -1)
    const z = entry.z
    const yBase = isUpper ? JAW_GAP * 0.5 : -(JAW_GAP * 0.5)
    const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[toothData.position] || 7
    const y = yBase + (isUpper ? -md * S * 0.5 - 0.6 : md * S * 0.5 + 0.6)

    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, 128, 64)
    ctx.fillStyle = 'rgba(12,18,30,0.9)'
    ctx.beginPath()
    ctx.roundRect(4, 4, 120, 56, 8)
    ctx.fill()
    ctx.strokeStyle = '#6366F1'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.roundRect(4, 4, 120, 56, 8)
    ctx.stroke()
    ctx.fillStyle = '#A5B4FC'
    ctx.font = 'bold 24px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(toothData.clinicalId, 64, 32)

    const tex = new THREE.CanvasTexture(canvas)
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false })
    const sprite = new THREE.Sprite(spriteMat)
    sprite.position.set(x, y, z)
    sprite.scale.set(0.7, 0.35, 1)
    scene.add(sprite)
    numberLabels.push(sprite)
  }
}

async function buildTeeth() {
  upperJawGroup.clear()
  lowerJawGroup.clear()
  clickableMeshes = []
  toothMap.clear()
  originalMaterials.clear()

  for (const toothData of props.teeth) {
    const isUpper = toothData.quadrant <= 2
    const isRight = toothData.quadrant === 1 || toothData.quadrant === 4
    const parentGroup = isUpper ? upperJawGroup : lowerJawGroup
    const arch = isUpper ? MAX_ARCH : MAND_ARCH
    const entry = arch.find(a => a.pos === toothData.position) || arch[0]
    const isExtracted = toothData.status === 'extracted'

    const group = new THREE.Group()

    if (isExtracted) {
      const ringGeo = new THREE.RingGeometry(0.1, 0.3, 24)
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.9,
        side: THREE.DoubleSide,
      })
      const ring = new THREE.Mesh(ringGeo, ringMat)
      ring.rotation.x = -Math.PI / 2
      ring.position.y = 0.02
      group.add(ring)
    } else {
      const geo = getToothGeo(toothData.position, isUpper)
      const mat = makeToothMaterial(false, toothData.status)
      const mesh = new THREE.Mesh(geo, mat)
      mesh.castShadow = true
      mesh.receiveShadow = true
      group.add(mesh)
      clickableMeshes.push(mesh)
      toothMap.set(mesh, toothData)

      const rootGroup = createRoot(toothData.position, isUpper)
      group.add(rootGroup)

      const occlusalGroup = createOcclusalSurface(toothData.position, isUpper)
      occlusalGroup.position.y = isUpper ? -0.01 : 0.01
      group.add(occlusalGroup)

      applyStatusColor(group, toothData.status)
    }

    const x = entry.x * (isRight ? 1 : -1)
    const z = entry.z
    const md = (isUpper ? TOOTH_MESIODISTAL.max : TOOTH_MESIODISTAL.mand)[toothData.position] || 7
    const yBase = isUpper ? JAW_GAP * 0.5 : -(JAW_GAP * 0.5)
    const y = yBase

    group.position.set(x, y, z)

    const baseRotY = isRight ? -entry.tangent : entry.tangent
    group.rotation.y = baseRotY
    group.rotation.z = THREE.MathUtils.degToRad(isRight ? -entry.tilt : entry.tilt)

    if (!isUpper) {
      group.rotation.x = Math.PI
    }

    parentGroup.add(group)
    group.userData = { baseY: y }
  }
}

function init() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x080C14)
  scene.fog = new THREE.Fog(0x080C14, 18, 35)

  camera = new THREE.PerspectiveCamera(36, 800 / 480, 0.1, 100)
  camera.position.set(0, 6, 12)
  camera.lookAt(0, 0, 0.5)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setSize(800, 480)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.4
  renderer.outputColorSpace = THREE.SRGBColorSpace

  if (container.value) container.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.07
  controls.minDistance = 2
  controls.maxDistance = 25
  controls.maxPolarAngle = Math.PI * 0.85
  controls.target.set(0, 0, 0.5)

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  scene.add(new THREE.AmbientLight(0x404060, 0.6))

  const key = new THREE.DirectionalLight(0xFFF8F0, 2.5)
  key.position.set(5, 12, 7)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 35
  key.shadow.camera.left = -10
  key.shadow.camera.right = 10
  key.shadow.camera.top = 10
  key.shadow.camera.bottom = -10
  key.shadow.normalBias = 0.02
  key.shadow.bias = -0.0005
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xD0E0FF, 0.6)
  fill.position.set(-6, 5, -5)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xFFD0E8, 0.35)
  rim.position.set(0, -4, -8)
  scene.add(rim)

  const topPt = new THREE.PointLight(0xFFFFFF, 0.5, 25)
  topPt.position.set(0, 10, 0)
  scene.add(topPt)

  const spotFront = new THREE.SpotLight(0xFFF5E8, 0.5, 25, Math.PI / 4)
  spotFront.position.set(0, 6, 10)
  scene.add(spotFront)

  const spotLeft = new THREE.SpotLight(0xFFF0E0, 0.35, 20, Math.PI / 5)
  spotLeft.position.set(-7, 6, 2)
  scene.add(spotLeft)

  const spotRight = new THREE.SpotLight(0xFFF0E0, 0.35, 20, Math.PI / 5)
  spotRight.position.set(7, 6, 2)
  scene.add(spotRight)

  const envGeo = new THREE.CircleGeometry(16, 64)
  const envMat = new THREE.MeshStandardMaterial({ color: 0x0E1420, roughness: 0.85, metalness: 0.1 })
  const env = new THREE.Mesh(envGeo, envMat)
  env.rotation.x = -Math.PI / 2
  env.position.y = -3
  env.receiveShadow = true
  scene.add(env)

  const xrayCenter = new THREE.PointLight(0x00AAFF, 0, 15)
  xrayCenter.position.set(0, 0, 0)
  scene.add(xrayCenter)
  const xrayL = new THREE.PointLight(0x0066FF, 0, 12)
  xrayL.position.set(5, 3, 5)
  scene.add(xrayL)
  const xrayR = new THREE.PointLight(0x0066FF, 0, 12)
  xrayR.position.set(-5, 3, 5)
  scene.add(xrayR)
  xrayLights = [xrayCenter, xrayL, xrayR]

  jawBoneGroup.add(createMandible())
  jawBoneGroup.add(createMaxilla())
  jawBoneGroup.add(createGingiva(true))
  jawBoneGroup.add(createGingiva(false))
  scene.add(jawBoneGroup)

  upperJawGroup.name = 'upperJaw'
  lowerJawGroup.name = 'lowerJaw'
  scene.add(upperJawGroup)
  scene.add(lowerJawGroup)

  const ro = new ResizeObserver(() => {
    if (!container.value) return
    const w = container.value.clientWidth
    const h = container.value.clientHeight
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  })
  ro.observe(container.value)
}

function onMouseMove(e) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(clickableMeshes)

  if (hoveredGroup) {
    hoveredGroup.traverse((c) => {
      if (c.isMesh && originalMaterials.has(c.uuid)) {
        c.material = originalMaterials.get(c.uuid).clone()
      }
    })
    hoveredGroup = null
    hoveredInfo.value = null
  }

  if (hits.length > 0) {
    const mesh = hits[0].object
    const data = toothMap.get(mesh)
    if (data) {
      hoveredGroup = mesh.parent?.parent || mesh.parent
      if (hoveredGroup) {
        hoveredGroup.traverse((c) => {
          if (c.isMesh && !originalMaterials.has(c.uuid)) {
            originalMaterials.set(c.uuid, c.material.clone())
          }
          if (c.isMesh) {
            c.material = c.material.clone()
            c.material.emissive = new THREE.Color(0x3344AA)
            c.material.emissiveIntensity = 0.15
          }
        })
      }
      hoveredInfo.value = {
        id: data.clinicalId,
        name: TOOTH_NAMES[data.position] || '',
      }
      tagStyle.value = {
        left: (e.clientX - rect.left + 14) + 'px',
        top: (e.clientY - rect.top - 8) + 'px',
      }
      container.value.style.cursor = 'pointer'
    }
  } else {
    container.value.style.cursor = 'grab'
  }
}

function onClick(e) {
  if (!container.value) return
  const rect = container.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(clickableMeshes)
  if (hits.length > 0) {
    const data = toothMap.get(hits[0].object)
    if (data) emit('select-tooth', data)
  }
}

function animate() {
  animId = requestAnimationFrame(animate)
  animTime += 0.016
  controls.update()

  if (props.selectedTooth) {
    const selIdx = props.teeth.findIndex(t => t.id === props.selectedTooth.id)
    if (selIdx >= 0) {
      const toothData = props.teeth[selIdx]
      const isUpper = toothData.quadrant <= 2
      const g = isUpper ? upperJawGroup : lowerJawGroup
      const upperCount = props.teeth.filter(t => t.quadrant <= 2).length
      const localIdx = isUpper ? selIdx : selIdx - upperCount
      const grp = g.children[localIdx]
      if (grp) {
        const floatY = Math.sin(animTime * 3) * 0.06
        grp.position.y = (grp.userData?.baseY ?? grp.position.y) + floatY
      }
    }
  }

  renderer.render(scene, camera)
}

function resetCamera() {
  camera.position.set(0, 6, 12)
  camera.lookAt(0, 0, 0.5)
  controls.target.set(0, 0, 0.5)
}

onMounted(async () => {
  await nextTick()
  init()
  buildTeeth()
  animate()
  ready.value = true
  if (container.value) {
    container.value.addEventListener('mousemove', onMouseMove)
    container.value.addEventListener('click', onClick)
  }
})

onBeforeUnmount(() => {
  if (animId) cancelAnimationFrame(animId)
  if (container.value) {
    container.value.removeEventListener('mousemove', onMouseMove)
    container.value.removeEventListener('click', onClick)
  }
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement.parentNode === container.value) {
      container.value.removeChild(renderer.domElement)
    }
  }
})

watch(() => props.teeth, () => {
  if (ready.value) buildTeeth()
}, { deep: true })

watch(() => props.xrayMode, (val) => {
  if (ready.value) applyXrayMode(val)
})

watch(() => props.showGums, (val) => {
  if (ready.value) jawBoneGroup.visible = val
})

watch(() => props.showNumbers, () => {
  if (ready.value) buildToothNumbers()
})

watch(() => props.selectedTooth, (newSel, oldSel) => {
  if (!ready.value) return
  const resetGroup = (toothData) => {
    if (!toothData) return
    const isUpper = toothData.quadrant <= 2
    const g = isUpper ? upperJawGroup : lowerJawGroup
    for (const grp of g.children) {
      grp.position.y = grp.userData?.baseY ?? grp.position.y
    }
  }
  resetGroup(oldSel)
})

defineExpose({ resetCamera })
</script>

<style scoped>
.three-jaw-container {
  width: 100%;
  height: 500px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #080C14;
  cursor: grab;
}
.three-jaw-container:active { cursor: grabbing; }
.three-jaw-container canvas { display: block; width: 100% !important; height: 100% !important; }

.hover-tag {
  position: absolute;
  background: rgba(10, 14, 24, 0.93);
  border: 1px solid #6366F1;
  border-radius: 6px;
  padding: 4px 10px;
  display: flex; gap: 6px; align-items: center;
  pointer-events: none; z-index: 20; white-space: nowrap;
}
.tag-id { color: #A5B4FC; font-weight: 800; font-size: 13px; }
.tag-name { color: #E5E7EB; font-size: 12px; }
</style>
