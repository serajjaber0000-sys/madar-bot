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

const SURFACE_DEFAULTS = { oclusal: 'healthy', vestibular: 'healthy', lingual: 'healthy', mesial: 'healthy', distal: 'healthy' }

const initialPermanentTeeth = []
for (let q = 1; q <= 4; q++) {
  for (let i = 1; i <= 8; i++) {
    initialPermanentTeeth.push({
      id: q * 10 + i,
      clinicalId: `${q}.${i}`,
      quadrant: q,
      position: i,
      status: 'healthy',
      surfaces: { ...SURFACE_DEFAULTS },
      notes: '',
      mobilityGrade: 0,
      pocketDepth: 0,
    })
  }
}

const initialTemporaryTeeth = []
for (let q = 1; q <= 4; q++) {
  for (let i = 1; i <= 5; i++) {
    initialTemporaryTeeth.push({
      id: (q + 4) * 10 + i,
      clinicalId: `${q + 4}.${i}`,
      quadrant: q,
      position: i,
      status: 'healthy',
      isTemporary: true,
      surfaces: { ...SURFACE_DEFAULTS },
      notes: '',
    })
  }
}

const TOOTH_TYPES = {
  PERMANENT: { 1: 'Incisor', 2: 'Incisor', 3: 'Canine', 4: 'Premolar', 5: 'Premolar', 6: 'Molar', 7: 'Molar', 8: 'Wisdom' },
  TEMPORARY: { 1: 'Incisor', 2: 'Incisor', 3: 'Canine', 4: 'Molar', 5: 'Molar' },
}

const TOOTH_GROUPS = {
  CENTRAL_POSITIONS: [1, 2, 3],
  LATERAL_POSITIONS: [4, 5, 6, 7, 8],
}

const TOOTH_NAMES_AR = {
  PERMANENT: {
    1: 'قاطع مركزي', 2: 'قاطع جانبي', 3: 'ناب',
    4: 'ضاحك أول', 5: 'ضاحك ثاني', 6: 'طاحن أول',
    7: 'طاحن ثاني', 8: 'ضرس العقل',
  },
  TEMPORARY: {
    1: 'قاطع مركزي', 2: 'قاطع جانبي', 3: 'ناب',
    4: 'طاحن أول', 5: 'طاحن ثاني',
  },
}

export {
  STATUS_LIST,
  SURFACE_NAMES,
  SURFACE_DEFAULTS,
  initialPermanentTeeth,
  initialTemporaryTeeth,
  TOOTH_TYPES,
  TOOTH_GROUPS,
  TOOTH_NAMES_AR,
}
