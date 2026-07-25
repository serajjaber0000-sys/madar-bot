<template>
  <div class="realistic-jaw" ref="wrapper">
    <svg :viewBox="viewBox" xmlns="http://www.w3.org/2000/svg" class="jaw-svg">
      <defs>
        <!-- Gum gradients -->
        <linearGradient id="gumUpper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8A0B4" />
          <stop offset="50%" stop-color="#D4849A" />
          <stop offset="100%" stop-color="#C06880" />
        </linearGradient>
        <linearGradient id="gumLower" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#E8A0B4" />
          <stop offset="50%" stop-color="#D4849A" />
          <stop offset="100%" stop-color="#C06880" />
        </linearGradient>

        <!-- Tooth enamel gradients -->
        <linearGradient id="toothWhite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FEFEFE" />
          <stop offset="30%" stop-color="#F5F0E8" />
          <stop offset="70%" stop-color="#EDE5D8" />
          <stop offset="100%" stop-color="#E0D8C8" />
        </linearGradient>
        <linearGradient id="toothWhiteHover" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="50%" stop-color="#F8F4EE" />
          <stop offset="100%" stop-color="#F0E8DD" />
        </linearGradient>
        <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8DDD0" />
          <stop offset="100%" stop-color="#C8B8A0" />
        </linearGradient>

        <!-- Condition colors -->
        <linearGradient id="cond-caries" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#8B4513" /><stop offset="100%" stop-color="#5C2D0A" />
        </linearGradient>
        <linearGradient id="cond-filled" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#C0D8F0" /><stop offset="100%" stop-color="#90B8E0" />
        </linearGradient>
        <linearGradient id="cond-crown" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E8C860" /><stop offset="50%" stop-color="#D4A830" /><stop offset="100%" stop-color="#B89020" />
        </linearGradient>
        <linearGradient id="cond-implant" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E0E0E0" /><stop offset="50%" stop-color="#B0B0B0" /><stop offset="100%" stop-color="#808080" />
        </linearGradient>
        <linearGradient id="cond-rootCanal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFB0C0" /><stop offset="100%" stop-color="#E06080" />
        </linearGradient>
        <linearGradient id="cond-fracture" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#FFA040" /><stop offset="100%" stop-color="#D06020" />
        </linearGradient>

        <!-- Shadow filter -->
        <filter id="toothShadow" x="-10%" y="-5%" width="120%" height="115%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.25"/>
        </filter>
        <filter id="gumShadow">
          <feDropShadow dx="0" dy="0.5" stdDeviation="2" flood-color="#800030" flood-opacity="0.15"/>
        </filter>

        <!-- Selected glow -->
        <filter id="selectedGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur"/>
          <feFlood flood-color="#6366F1" flood-opacity="0.6" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>

        <!-- Tooth clip paths for surface coloring -->
        <clipPath v-for="tooth in allTeeth" :key="'clip-'+tooth.id" :id="'toothClip-'+tooth.id">
          <path :d="getToothPath(tooth)" />
        </clipPath>
      </defs>

      <!-- ===== UPPER JAW ===== -->
      <g class="upper-jaw">
        <!-- Maxilla bone shape -->
        <path :d="maxillaPath" fill="url(#gumUpper)" filter="url(#gumShadow)" opacity="0.9"/>

        <!-- Upper teeth -->
        <g v-for="tooth in upperTeeth" :key="tooth.id"
           class="tooth-group"
           :class="{ selected: selectedTooth?.id === tooth.id, hovered: hoveredTooth === tooth.id, extracted: tooth.status === 'extracted' }"
           @click="selectTooth(tooth)"
           @mouseenter="hoveredTooth = tooth"
           @mouseleave="hoveredTooth = null"
           :filter="selectedTooth?.id === tooth.id ? 'url(#selectedGlow)' : 'url(#toothShadow)'">

          <!-- Root (above gum) -->
          <g v-if="tooth.status !== 'extracted'" class="tooth-roots">
            <path v-for="(root, ri) in getRoots(tooth)" :key="ri"
                  :d="root" fill="url(#rootGrad)" opacity="0.7"/>
          </g>

          <!-- Crown body -->
          <g v-if="tooth.status !== 'extracted'" class="tooth-crown">
            <path :d="getToothPath(tooth)" fill="url(#toothWhite)" stroke="#C8B8A0" stroke-width="0.4"/>
            <!-- Surface overlays for condition -->
            <path v-if="tooth.status !== 'healthy'" :d="getToothPath(tooth)"
                  :fill="getConditionFill(tooth.status)" clip-path="url(#toothClip)" opacity="0.85"/>
          </g>

          <!-- Extracted X -->
          <g v-if="tooth.status === 'extracted'" class="extracted-mark">
            <line :x1="tooth.cx - 4" :y1="tooth.cy - 5" :x2="tooth.cx + 4" :y2="tooth.cy + 5"
                  stroke="#DC2626" stroke-width="1.5" stroke-linecap="round"/>
            <line :x1="tooth.cx + 4" :y1="tooth.cy - 5" :x2="tooth.cx - 4" :y2="tooth.cy + 5"
                  stroke="#DC2626" stroke-width="1.5" stroke-linecap="round"/>
          </g>

          <!-- Surface click zones (invisible) -->
          <g v-if="tooth.status !== 'extracted'" class="surface-zones" clip-path="url(#toothClip)">
            <rect v-for="sz in getSurfaceZones(tooth)" :key="sz.key"
                  :x="sz.x" :y="sz.y" :width="sz.w" :height="sz.h"
                  :fill="getSurfaceColor(tooth, sz.key)" fill-opacity="0.35"
                  stroke="transparent" stroke-width="0.3"
                  class="surface-zone"
                  @click.stop="selectSurface(tooth, sz.key)"
                  @mouseenter="hoveredSurface = sz.key"
                  @mouseleave="hoveredSurface = null"/>
          </g>

          <!-- FDI label -->
          <text :x="tooth.cx" :y="isUpper(tooth) ? tooth.cy - tooth.crownH/2 - 4 : tooth.cy + tooth.crownH/2 + 4"
                text-anchor="middle" class="fdi-num" :class="{ 'fdi-selected': selectedTooth?.id === tooth.id }">
            {{ tooth.clinicalId }}
          </text>
        </g>

        <!-- Upper arch label -->
        <text :x="svgW/2" :y="8" text-anchor="middle" class="arch-label">الفك العلوي — Maxilla</text>
      </g>

      <!-- ===== LOWER JAW ===== -->
      <g class="lower-jaw">
        <!-- Mandible bone shape -->
        <path :d="mandiblePath" fill="url(#gumLower)" filter="url(#gumShadow)" opacity="0.9"/>

        <!-- Lower teeth -->
        <g v-for="tooth in lowerTeeth" :key="tooth.id"
           class="tooth-group"
           :class="{ selected: selectedTooth?.id === tooth.id, hovered: hoveredTooth === tooth.id, extracted: tooth.status === 'extracted' }"
           @click="selectTooth(tooth)"
           @mouseenter="hoveredTooth = tooth"
           @mouseleave="hoveredTooth = null"
           :filter="selectedTooth?.id === tooth.id ? 'url(#selectedGlow)' : 'url(#toothShadow)'">

          <!-- Root -->
          <g v-if="tooth.status !== 'extracted'" class="tooth-roots">
            <path v-for="(root, ri) in getRoots(tooth)" :key="ri"
                  :d="root" fill="url(#rootGrad)" opacity="0.7"/>
          </g>

          <!-- Crown -->
          <g v-if="tooth.status !== 'extracted'" class="tooth-crown">
            <path :d="getToothPath(tooth)" fill="url(#toothWhite)" stroke="#C8B8A0" stroke-width="0.4"/>
            <path v-if="tooth.status !== 'healthy'" :d="getToothPath(tooth)"
                  :fill="getConditionFill(tooth.status)" clip-path="url(#toothClip)" opacity="0.85"/>
          </g>

          <!-- Extracted X -->
          <g v-if="tooth.status === 'extracted'" class="extracted-mark">
            <line :x1="tooth.cx - 4" :y1="tooth.cy - 5" :x2="tooth.cx + 4" :y2="tooth.cy + 5"
                  stroke="#DC2626" stroke-width="1.5" stroke-linecap="round"/>
            <line :x1="tooth.cx + 4" :y1="tooth.cy - 5" :x2="tooth.cx - 4" :y2="tooth.cy + 5"
                  stroke="#DC2626" stroke-width="1.5" stroke-linecap="round"/>
          </g>

          <!-- Surface zones -->
          <g v-if="tooth.status !== 'extracted'" class="surface-zones" clip-path="url(#toothClip)">
            <rect v-for="sz in getSurfaceZones(tooth)" :key="sz.key"
                  :x="sz.x" :y="sz.y" :width="sz.w" :height="sz.h"
                  :fill="getSurfaceColor(tooth, sz.key)" fill-opacity="0.35"
                  class="surface-zone"
                  @click.stop="selectSurface(tooth, sz.key)"/>
          </g>

          <!-- FDI label -->
          <text :x="tooth.cx" :y="isUpper(tooth) ? tooth.cy - tooth.crownH/2 - 4 : tooth.cy + tooth.crownH/2 + 4"
                text-anchor="middle" class="fdi-num" :class="{ 'fdi-selected': selectedTooth?.id === tooth.id }">
            {{ tooth.clinicalId }}
          </text>
        </g>

        <text :x="svgW/2" :y="svgH - 4" text-anchor="middle" class="arch-label">الفك السفلي — Mandible</text>
      </g>

      <!-- Center midline -->
      <line :x1="svgW/2" :y1="svgH * 0.28" :x2="svgW/2" :y2="svgH * 0.72"
            stroke="#C06880" stroke-width="0.5" stroke-dasharray="2,2" opacity="0.4"/>

      <!-- Hover tooltip -->
      <g v-if="hoveredTooth" class="tooltip-g">
        <rect :x="hoveredTooth.cx - 18" :y="hoveredTooth.cy - 22" width="36" height="12"
              rx="3" fill="#1F2937" stroke="#6366F1" stroke-width="0.5"/>
        <text :x="hoveredTooth.cx" :y="hoveredTooth.cy - 14" text-anchor="middle"
              fill="#F9FAFB" font-size="5" font-weight="600">{{ hoveredTooth.clinicalId }} {{ getToothName(hoveredTooth) }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  teeth: { type: Array, required: true },
  selectedTooth: { type: Object, default: null },
})

const emit = defineEmits(['select-tooth', 'select-surface'])

const wrapper = ref(null)
const hoveredTooth = ref(null)
const hoveredSurface = ref(null)

const svgW = 300
const svgH = 260
const viewBox = `0 0 ${svgW} ${svgH}`

// Tooth shape specs per position type
const TOOTH_SPECS = {
  1: { crownW: 7, crownH: 9, rootW: 2.5, rootLen: 8, roots: 1, shape: 'incisor' },
  2: { crownW: 6, crownH: 8.5, rootW: 2.2, rootLen: 7.5, roots: 1, shape: 'incisor' },
  3: { crownW: 6.5, crownH: 10, rootW: 2.8, rootLen: 10, roots: 1, shape: 'canine' },
  4: { crownW: 7, crownH: 7.5, rootW: 2.5, rootLen: 7, roots: 2, shape: 'premolar' },
  5: { crownW: 7.2, crownH: 7.5, rootW: 2.5, rootLen: 7, roots: 2, shape: 'premolar' },
  6: { crownW: 8, crownH: 7, rootW: 3, rootLen: 6.5, roots: 3, shape: 'molar' },
  7: { crownW: 7.5, crownH: 7, rootW: 2.8, rootLen: 6, roots: 3, shape: 'molar' },
  8: { crownW: 6.5, crownH: 6.5, rootW: 2.5, rootLen: 5.5, roots: 2, shape: 'molar' },
}

// Arch geometry: positions along the arch curve
function archX(position, quadrant) {
  const archHalfW = 120
  const t = (position - 1) / 7
  const x = svgW / 2 + (t - 0.5) * archHalfW * 2
  if (quadrant === 1 || quadrant === 3) {
    return svgW / 2 + (0.5 - t) * archHalfW
  } else {
    return svgW / 2 + (t - 0.5) * archHalfW
  }
}

function archY(position, quadrant) {
  const curvature = 15
  const t = (position - 1) / 7
  const curve = curvature * Math.pow(2 * t - 1, 2)
  if (quadrant <= 2) {
    return svgH * 0.38 - curve
  } else {
    return svgH * 0.62 + curve
  }
}

const upperTeeth = computed(() =>
  props.teeth.filter(t => t.quadrant <= 2).map(t => ({
    ...t,
    cx: archX(t.position, t.quadrant),
    cy: archY(t.position, t.quadrant),
    spec: TOOTH_SPECS[t.position],
    crownW: TOOTH_SPECS[t.position].crownW,
    crownH: TOOTH_SPECS[t.position].crownH,
    isUpper: t.quadrant <= 2,
  }))
)

const lowerTeeth = computed(() =>
  props.teeth.filter(t => t.quadrant >= 3).map(t => ({
    ...t,
    cx: archX(t.position, t.quadrant),
    cy: archY(t.position, t.quadrant),
    spec: TOOTH_SPECS[t.position],
    crownW: TOOTH_SPECS[t.position].crownW,
    crownH: TOOTH_SPECS[t.position].crownH,
    isUpper: t.quadrant <= 2,
  }))
)

const allTeeth = computed(() => [...upperTeeth.value, ...lowerTeeth.value])

function isUpper(tooth) {
  return tooth.quadrant <= 2
}

// Maxilla gum path
const maxillaPath = computed(() => {
  const y1 = svgH * 0.24
  const y2 = svgH * 0.44
  const w = svgW
  return `M ${w * 0.05},${y1}
    Q ${w * 0.15},${y1 - 4} ${w * 0.3},${y1 - 2}
    Q ${w * 0.5},${y1 + 2} ${w * 0.7},${y1 - 2}
    Q ${w * 0.85},${y1 - 4} ${w * 0.95},${y1}
    L ${w * 0.92},${y2 + 5}
    Q ${w * 0.75},${y2 + 12} ${w * 0.5},${y2 + 14}
    Q ${w * 0.25},${y2 + 12} ${w * 0.08},${y2 + 5}
    Z`
})

// Mandible gum path
const mandiblePath = computed(() => {
  const y1 = svgH * 0.56
  const y2 = svgH * 0.76
  const w = svgW
  return `M ${w * 0.05},${y2}
    Q ${w * 0.15},${y2 + 4} ${w * 0.3},${y2 + 2}
    Q ${w * 0.5},${y2 - 2} ${w * 0.7},${y2 + 2}
    Q ${w * 0.85},${y2 + 4} ${w * 0.95},${y2}
    L ${w * 0.92},${y1 - 5}
    Q ${w * 0.75},${y1 - 12} ${w * 0.5},${y1 - 14}
    Q ${w * 0.25},${y1 - 12} ${w * 0.08},${y1 - 5}
    Z`
})

// Generate tooth SVG path
function getToothPath(tooth) {
  const { cx, cy, spec, isUpper } = tooth
  const hw = spec.crownW / 2
  const hh = spec.crownH / 2
  const shape = spec.shape

  const dir = isUpper ? 1 : -1

  if (shape === 'incisor') {
    return `M ${cx - hw},${cy - hh * dir * 0.3}
      Q ${cx - hw * 0.9},${cy - hh * dir} ${cx - hw * 0.3},${cy - hh * dir}
      L ${cx + hw * 0.3},${cy - hh * dir}
      Q ${cx + hw * 0.9},${cy - hh * dir} ${cx + hw},${cy - hh * dir * 0.3}
      L ${cx + hw * 0.85},${cy + hh * dir * 0.6}
      Q ${cx + hw * 0.4},${cy + hh * dir} ${cx},${cy + hh * dir}
      Q ${cx - hw * 0.4},${cy + hh * dir} ${cx - hw * 0.85},${cy + hh * dir * 0.6}
      Z`
  }

  if (shape === 'canine') {
    const tipY = isUpper ? cy - hh * 1.1 : cy + hh * 1.1
    return `M ${cx},${tipY}
      Q ${cx + hw * 0.6},${tipY + hh * 0.5 * dir} ${cx + hw},${cy - hh * 0.2 * dir}
      L ${cx + hw * 0.85},${cy + hh * 0.7 * dir}
      Q ${cx + hw * 0.3},${cy + hh * dir} ${cx},${cy + hh * dir}
      Q ${cx - hw * 0.3},${cy + hh * dir} ${cx - hw * 0.85},${cy + hh * 0.7 * dir}
      L ${cx - hw},${cy - hh * 0.2 * dir}
      Q ${cx - hw * 0.6},${tipY + hh * 0.5 * dir} ${cx},${tipY}
      Z`
  }

  if (shape === 'premolar') {
    const cuspOff = hw * 0.25
    return `M ${cx - hw},${cy - hh * 0.1 * dir}
      Q ${cx - hw * 0.9},${cy - hh * dir} ${cx - cuspOff},${cy - hh * dir}
      L ${cx - 0.5},${cy - hh * 0.85 * dir}
      L ${cx + 0.5},${cy - hh * 0.85 * dir}
      L ${cx + cuspOff},${cy - hh * dir}
      Q ${cx + hw * 0.9},${cy - hh * dir} ${cx + hw},${cy - hh * 0.1 * dir}
      L ${cx + hw * 0.85},${cy + hh * 0.7 * dir}
      Q ${cx + hw * 0.4},${cy + hh * dir} ${cx},${cy + hh * dir}
      Q ${cx - hw * 0.4},${cy + hh * dir} ${cx - hw * 0.85},${cy + hh * 0.7 * dir}
      Z`
  }

  // Molar
  const mw = hw * 0.3
  return `M ${cx - hw},${cy - hh * 0.1 * dir}
    Q ${cx - hw * 0.95},${cy - hh * dir} ${cx - mw * 1.5},${cy - hh * dir}
    Q ${cx - mw},${cy - hh * 0.85 * dir} ${cx - mw * 0.3},${cy - hh * dir}
    L ${cx + mw * 0.3},${cy - hh * dir}
    Q ${cx + mw},${cy - hh * 0.85 * dir} ${cx + mw * 1.5},${cy - hh * dir}
    Q ${cx + hw * 0.95},${cy - hh * dir} ${cx + hw},${cy - hh * 0.1 * dir}
    L ${cx + hw * 0.85},${cy + hh * 0.7 * dir}
    Q ${cx + hw * 0.4},${cy + hh * dir} ${cx},${cy + hh * dir}
    Q ${cx - hw * 0.4},${cy + hh * dir} ${cx - hw * 0.85},${cy + hh * 0.7 * dir}
    Z`
}

// Root paths
function getRoots(tooth) {
  const { cx, cy, spec, isUpper } = tooth
  const dir = isUpper ? -1 : 1
  const rootLen = spec.rootLen
  const rootW = spec.rootW / 2
  const count = spec.roots
  const roots = []

  if (count === 1) {
    roots.push(`M ${cx - rootW},${cy + dir * spec.crownH * 0.4}
      Q ${cx - rootW * 0.5},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx},${cy + dir * (spec.crownH * 0.4 + rootLen)}
      Q ${cx + rootW * 0.5},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx + rootW},${cy + dir * spec.crownH * 0.4}`)
  } else if (count === 2) {
    const off = rootW * 1.8
    for (const s of [-1, 1]) {
      roots.push(`M ${cx + s * off - rootW * 0.7},${cy + dir * spec.crownH * 0.4}
        Q ${cx + s * off - rootW * 0.3},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx + s * off},${cy + dir * (spec.crownH * 0.4 + rootLen)}
        Q ${cx + s * off + rootW * 0.3},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx + s * off + rootW * 0.7},${cy + dir * spec.crownH * 0.4}`)
    }
  } else {
    const off = rootW * 2
    for (const s of [-1, 0, 1]) {
      roots.push(`M ${cx + s * off - rootW * 0.6},${cy + dir * spec.crownH * 0.4}
        Q ${cx + s * off - rootW * 0.2},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx + s * off},${cy + dir * (spec.crownH * 0.4 + rootLen)}
        Q ${cx + s * off + rootW * 0.2},${cy + dir * (spec.crownH * 0.4 + rootLen * 0.5)} ${cx + s * off + rootW * 0.6},${cy + dir * spec.crownH * 0.4}`)
    }
  }
  return roots
}

// Surface zones (vestibular, mesial, oclusal, distal, lingual)
function getSurfaceZones(tooth) {
  const { cx, cy, spec, isUpper } = tooth
  const hw = spec.crownW / 2
  const hh = spec.crownH / 2
  const dir = isUpper ? -1 : 1
  const top = isUpper ? cy - hh : cy
  const bot = isUpper ? cy : cy + hh

  return [
    { key: 'vestibular', x: cx - hw * 0.7, y: top, w: hw * 1.4, h: hh * 0.5 },
    { key: 'oclusal',    x: cx - hw * 0.6, y: top + hh * 0.45, w: hw * 1.2, h: hh * 0.35 },
    { key: 'lingual',    x: cx - hw * 0.7, y: bot - hh * 0.1, w: hw * 1.4, h: hh * 0.5 },
    { key: 'mesial',     x: cx - hw * 0.9, y: top + hh * 0.2, w: hw * 0.4, h: hh * 0.6 },
    { key: 'distal',     x: cx + hw * 0.5, y: top + hh * 0.2, w: hw * 0.4, h: hh * 0.6 },
  ]
}

const SURFACE_COLORS = {
  healthy: 'transparent',
  caries: '#EF4444',
  filled: '#3B82F6',
  crown: '#F59E0B',
  extracted: 'transparent',
  implant: '#8B5CF6',
  root_canal: '#EC4899',
  fracture: '#F97316',
  bridge: '#6366F1',
  extraction_indicated: '#DC2626',
  not_erupted: '#9CA3AF',
}

function getSurfaceColor(tooth, surfaceKey) {
  const status = tooth.surfaces?.[surfaceKey] || tooth.status || 'healthy'
  return SURFACE_COLORS[status] || 'transparent'
}

const CONDITION_FILLS = {
  caries: 'url(#cond-caries)',
  filled: 'url(#cond-filled)',
  crown: 'url(#cond-crown)',
  implant: 'url(#cond-implant)',
  root_canal: 'url(#cond-rootCanal)',
  fracture: 'url(#cond-fracture)',
  bridge: '#6366F1',
  extraction_indicated: '#DC2626',
  not_erupted: '#9CA3AF',
}

function getConditionFill(status) {
  return CONDITION_FILLS[status] || 'transparent'
}

const TOOTH_NAMES = {
  1: 'قاطع مركزي', 2: 'قاطع جانبي', 3: 'ناب', 4: 'ضاحك', 5: 'ضاحك', 6: 'طاحن', 7: 'طاحن', 8: 'ضرس عقل',
}

function getToothName(tooth) {
  return TOOTH_NAMES[tooth.position] || ''
}

function selectTooth(tooth) {
  emit('select-tooth', tooth)
}

function selectSurface(tooth, surfaceKey) {
  emit('select-surface', tooth, surfaceKey)
}
</script>

<style scoped>
.realistic-jaw {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 8px;
}

.jaw-svg {
  width: 100%;
  max-width: 900px;
  height: auto;
}

.tooth-group {
  cursor: pointer;
  transition: transform 0.15s ease;
}

.tooth-group:hover {
  transform: scale(1.05);
}

.tooth-group.extracted {
  opacity: 0.4;
  cursor: default;
}

.surface-zone {
  cursor: pointer;
  transition: fill-opacity 0.15s;
}

.surface-zone:hover {
  fill-opacity: 0.65 !important;
}

.fdi-num {
  font-family: 'Inter', monospace;
  font-size: 4px;
  font-weight: 700;
  fill: #6B7280;
  pointer-events: none;
  user-select: none;
}

.fdi-selected {
  fill: #6366F1;
  font-size: 4.5px;
}

.arch-label {
  font-family: 'Inter', sans-serif;
  font-size: 5px;
  fill: #6B7280;
  font-weight: 600;
  pointer-events: none;
}
</style>
