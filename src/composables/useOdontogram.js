import { ref, computed, watch } from 'vue'
import {
  initialPermanentTeeth,
  initialTemporaryTeeth,
  TOOTH_TYPES,
  TOOTH_GROUPS,
  TOOTH_NAMES_AR,
} from '@/data/odontogram'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const STATUS_LIST = [
  { value: 'healthy', label: { ar: 'سليم', en: 'Healthy' }, color: '#10B981' },
  { value: 'caries', label: { ar: 'تسوس', en: 'Caries' }, color: '#EF4444' },
  { value: 'filled', label: { ar: 'محشو', en: 'Filled' }, color: '#3B82F6' },
  { value: 'crown', label: { ar: 'تاج', en: 'Crown' }, color: '#F59E0B' },
  { value: 'extracted', label: { ar: 'مخلوع', en: 'Extracted' }, color: '#6B7280' },
  { value: 'implant', label: { ar: 'زراعة', en: 'Implant' }, color: '#8B5CF6' },
  { value: 'root_canal', label: { ar: 'علاج جذور', en: 'Root Canal' }, color: '#EC4899' },
  { value: 'fracture', label: { ar: 'مكسور', en: 'Fracture' }, color: '#F97316' },
  { value: 'bridge', label: { ar: 'جسر', en: 'Bridge' }, color: '#6366F1' },
  { value: 'extraction_indicated', label: { ar: 'يُنصح بالخلع', en: 'Extraction Indicated' }, color: '#DC2626' },
  { value: 'not_erupted', label: { ar: 'غير بارز', en: 'Not Erupted' }, color: '#9CA3AF' },
]

const SURFACE_NAMES = {
  oclusal: { ar: 'الماضغية', en: 'Occlusal' },
  vestibular: { ar: 'الشقّية', en: 'Vestibular' },
  lingual: { ar: 'اللسانية', en: 'Lingual' },
  mesial: { ar: 'الانسانية', en: 'Mesial' },
  distal: { ar: 'البعيدة', en: 'Distal' },
}

function cloneTeeth(list) {
  return list.map((t) => ({ ...t, surfaces: { oclusal: 'healthy', vestibular: 'healthy', lingual: 'healthy', mesial: 'healthy', distal: 'healthy' }, ...JSON.parse(JSON.stringify(t.surfaces || {})), notes: '', mobilityGrade: 0, pocketDepth: 0 }))
}

export function useOdontogram() {
  const authStore = useAuthStore()
  const lang = ref('ar')

  const teeth = ref(cloneTeeth(initialPermanentTeeth))
  const temporaryTeeth = ref(cloneTeeth(initialTemporaryTeeth))
  const showTemporary = ref(false)
  const selectedTooth = ref(null)
  const selectedSurface = ref(null)
  const activeStatus = ref('caries')

  const clinicId = computed(() => authStore.clinicId)

  function getToothName(tooth) {
    if (!tooth) return ''
    if (tooth.isTemporary) {
      return TOOTH_NAMES_AR.TEMPORARY[tooth.position] || ''
    }
    return TOOTH_NAMES_AR.PERMANENT[tooth.position] || ''
  }

  function getStatusInfo(value) {
    return STATUS_LIST.find((s) => s.value === value) || STATUS_LIST[0]
  }

  function getStatusColor(value) {
    return getStatusInfo(value).color
  }

  function setStatus(toothId, status, surfaceKey = null) {
    const list = toothId >= 50 ? temporaryTeeth.value : teeth.value
    const tooth = list.find((t) => t.id === toothId)
    if (!tooth) return
    if (surfaceKey) {
      if (!tooth.surfaces) tooth.surfaces = {}
      tooth.surfaces[surfaceKey] = status
    } else {
      tooth.status = status
      if (tooth.surfaces) {
        Object.keys(tooth.surfaces).forEach((k) => { tooth.surfaces[k] = status })
      }
    }
  }

  function getToothData(toothId) {
    const list = toothId >= 50 ? temporaryTeeth.value : teeth.value
    return list.find((t) => t.id === toothId) || null
  }

  function serialize() {
    return {
      permanent: teeth.value.map((t) => ({
        id: t.id,
        clinicalId: t.clinicalId,
        quadrant: t.quadrant,
        position: t.position,
        status: t.status,
        surfaces: { ...(t.surfaces || {}) },
        notes: t.notes || '',
        mobilityGrade: t.mobilityGrade || 0,
        pocketDepth: t.pocketDepth || 0,
      })),
      temporary: temporaryTeeth.value.map((t) => ({
        id: t.id,
        clinicalId: t.clinicalId,
        quadrant: t.quadrant,
        position: t.position,
        status: t.status,
        isTemporary: true,
        surfaces: { ...(t.surfaces || {}) },
        notes: t.notes || '',
      })),
    }
  }

  function deserialize(data) {
    if (!data) return
    if (data.permanent) {
      data.permanent.forEach((saved) => {
        const tooth = teeth.value.find((t) => t.id === saved.id)
        if (tooth) {
          Object.assign(tooth, saved, { surfaces: { ...tooth.surfaces, ...(saved.surfaces || {}) } })
        }
      })
    }
    if (data.temporary) {
      data.temporary.forEach((saved) => {
        const tooth = temporaryTeeth.value.find((t) => t.id === saved.id)
        if (tooth) {
          Object.assign(tooth, saved, { surfaces: { ...tooth.surfaces, ...(saved.surfaces || {}) } })
        }
      })
    }
  }

  function resetAll() {
    teeth.value = cloneTeeth(initialPermanentTeeth)
    temporaryTeeth.value = cloneTeeth(initialTemporaryTeeth)
    selectedTooth.value = null
    selectedSurface.value = null
  }

  async function loadFromFirestore(patientId) {
    if (!clinicId.value || !patientId) return
    const snap = await getDoc(doc(db, 'dentalCharts', `${clinicId.value}_${patientId}`))
    if (snap.exists()) {
      deserialize(snap.data().odontogram || snap.data())
    } else {
      resetAll()
    }
  }

  async function saveToFirestore(patientId) {
    if (!clinicId.value || !patientId) return
    await setDoc(doc(db, 'dentalCharts', `${clinicId.value}_${patientId}`), {
      clinicId: clinicId.value,
      patientId,
      odontogram: serialize(),
      updatedAt: new Date().toISOString(),
    })
  }

  const quadrantTeeth = computed(() => {
    const q = { 1: [], 2: [], 3: [], 4: [] }
    teeth.value.forEach((t) => { q[t.quadrant].push(t) })
    return q
  })

  const tempQuadrantTeeth = computed(() => {
    const q = { 1: [], 2: [], 3: [], 4: [] }
    temporaryTeeth.value.forEach((t) => { q[t.quadrant].push(t) })
    return q
  })

  return {
    teeth,
    temporaryTeeth,
    showTemporary,
    selectedTooth,
    selectedSurface,
    activeStatus,
    quadrantTeeth,
    tempQuadrantTeeth,
    statusList: STATUS_LIST,
    surfaceNames: SURFACE_NAMES,
    toothTypes: TOOTH_TYPES,
    toothGroups: TOOTH_GROUPS,
    getToothName,
    getStatusInfo,
    getStatusColor,
    setStatus,
    getToothData,
    serialize,
    deserialize,
    resetAll,
    loadFromFirestore,
    saveToFirestore,
  }
}
