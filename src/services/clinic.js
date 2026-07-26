import { db } from '../firebase/config'
import { useAuthStore } from '../stores/auth'
import {
  collection, query, where, getDocs, addDoc, updateDoc, deleteDoc,
  doc, getDoc, setDoc, orderBy, onSnapshot,
  runTransaction, increment
} from 'firebase/firestore'

function getAuthStore() {
  try { return useAuthStore() } catch { return null }
}

function validateClinicAccess(clinicId) {
  const store = getAuthStore()
  if (!store) return
  if (store.isSuperAdmin) return
  if (store.clinicId !== clinicId) {
    throw new Error('Access denied: clinicId mismatch')
  }
}

function todayIso() {
  const now = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`
}

function isoFromParts(y, m, d) {
  const p = (n) => String(n).padStart(2, '0')
  return `${y}-${p(m + 1)}-${p(d)}`
}

function shiftIsoDate(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + days)
  return isoFromParts(dt.getFullYear(), dt.getMonth(), dt.getDate())
}

function nextDayIso(iso) { return shiftIsoDate(iso, 1) }

function pad2(n) { return String(n).padStart(2, '0') }

// ===== المرضى =====
async function getNextFileNumber(clinicId) {
  const counterRef = doc(db, 'clinic_counters', clinicId)
  const num = await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(counterRef)
    const current = snap.exists() ? (snap.data().next_file_number || 0) : 0
    const next = current + 1
    transaction.set(counterRef, { next_file_number: next }, { merge: true })
    return next
  })
  return String(num).padStart(4, '0')
}

export const patientsRepo = {
  async list(clinicId, searchTerm) {
    validateClinicAccess(clinicId)
    const q = query(collection(db, 'patients'), where('clinicId', '==', clinicId), orderBy('full_name', 'asc'))
    const snap = await getDocs(q)
    let patients = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (searchTerm && searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase()
      patients = patients.filter(p =>
        (p.full_name || '').toLowerCase().includes(t) ||
        (p.phone || '').includes(t) ||
        (p.file_number || '').includes(t)
      )
    }
    return patients
  },

  async get(id) {
    const snap = await getDoc(doc(db, 'patients', id))
    if (!snap.exists()) return null
    const data = snap.data()
    return { id: snap.id, ...data }
  },

  async create(clinicId, data) {
    validateClinicAccess(clinicId)
    const fileNumber = await getNextFileNumber(clinicId)
    const docRef = await addDoc(collection(db, 'patients'), {
      clinicId, ...data, file_number: fileNumber,
      is_walkin: data.is_walkin || 0,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    })
    return { id: docRef.id, ...data, file_number: fileNumber }
  },

  async update(id, data) {
    await updateDoc(doc(db, 'patients', id), { ...data, updated_at: new Date().toISOString() })
    return { id, ...data }
  },

  async remove(id) {
    await deleteDoc(doc(db, 'patients', id))
    return { success: true }
  }
}

// ===== الحجوزات =====
export const appointmentsRepo = {
  async listWithInfo(clinicId, searchTerm) {
    validateClinicAccess(clinicId)
    const patients = await patientsRepo.list(clinicId, searchTerm)
    const today = todayIso()
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId)))
    const allAppts = apptSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    return patients.map(p => {
      const pAppts = allAppts.filter(a => a.patient_id === p.id)
      const last = pAppts.filter(a => a.appointment_date <= today).sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))[0]
      const next = pAppts.filter(a => a.appointment_date > today).sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))[0]
      return {
        ...p,
        last_visit: last ? last.appointment_date : null,
        next_appointment: next ? next.appointment_date : null,
        next_appointment_id: next ? next.id : null
      }
    })
  },

  async listForPatient(clinicId, patientId) {
    const snap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId), where('patient_id', '==', patientId), orderBy('appointment_date', 'desc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async listByDate(clinicId, date) {
    const targetDate = date || todayIso()
    const snap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId), where('appointment_date', '==', targetDate)))
    const appts = snap.docs.map(d => ({ id: d.id, ...d.data() }))

    const needPatientLookup = appts.some(a => !a.full_name)
    let pMap = {}
    if (needPatientLookup) {
      const patientIds = [...new Set(appts.filter(a => !a.full_name).map(a => a.patient_id))]
      for (const pid of patientIds) {
        const p = await patientsRepo.get(pid)
        if (p) pMap[pid] = p
      }
    }

    return appts.map(a => ({
      ...a,
      full_name: a.full_name || pMap[a.patient_id]?.full_name || '',
      phone: a.phone || pMap[a.patient_id]?.phone || '',
      age: a.age ?? pMap[a.patient_id]?.age ?? null
    })).sort((a, b) => (a.entered || 0) - (b.entered || 0) || (a.id || '').localeCompare(b.id || ''))
  },

  async add(clinicId, data) {
    const docRef = await addDoc(collection(db, 'appointments'), {
      clinicId,
      patient_name: data.patient_name || null,
      full_name: data.patient_name || data.full_name || null,
      phone: data.phone || null,
      age: data.age || null,
      gender: data.gender || null,
      reason: data.reason || null,
      appointment_date: data.appointment_date || todayIso(),
      start_time: data.start_time || null,
      end_time: data.end_time || null,
      doctor_name: data.doctor_name || null,
      specialty: data.specialty || null,
      location: data.location || null,
      device_id: data.device_id || null,
      status: data.status || 'booked',
      is_new_patient: data.is_new_patient ?? true,
      entered: 0,
      missed: 0,
      payment_status: null,
      amount: null,
      consultation_fee: null,
      created_at: data.created_at || new Date().toISOString()
    })
    return { success: true, id: docRef.id }
  },

  async create(clinicId, patientId, date, notes, startTime, endTime, consultationFee, bookedByName, extra) {
    validateClinicAccess(clinicId)
    const docRef = await addDoc(collection(db, 'appointments'), {
      clinicId, patient_id: patientId, appointment_date: date,
      start_time: startTime || null, end_time: endTime || null,
      notes: notes || null, entered: 0, missed: 0,
      payment_status: null, amount: null,
      consultation_fee: consultationFee || null,
      booked_by_name: bookedByName || null,
      doctor_id: extra?.doctor_id || null,
      status: extra?.status || 'booked',
      full_name: extra?.full_name || null,
      phone: extra?.phone || null,
      age: extra?.age || null,
      is_new_patient: extra?.is_new_patient ?? null,
      created_at: new Date().toISOString()
    })
    return { success: true, id: docRef.id }
  },

  async updateStatus(id, status) {
    const updates = { status }
    if (status === 'arrived') { updates.entered = 1; updates.missed = 0 }
    else if (status === 'missed') { updates.missed = 1; updates.entered = 0 }
    else if (status === 'booked') { updates.entered = 0; updates.missed = 0 }
    await updateDoc(doc(db, 'appointments', id), updates)
  },

  async complete(id, consultationFee) {
    const updates = { status: 'completed', entered: 1 }
    if (consultationFee != null) updates.consultation_fee = consultationFee
    await updateDoc(doc(db, 'appointments', id), updates)
  },

  async get(id) {
    const snap = await getDoc(doc(db, 'appointments', id))
    return snap.exists() ? { id: snap.id, ...snap.data() } : null
  },

  async update(id, date, notes, startTime, endTime) {
    await updateDoc(doc(db, 'appointments', id), {
      appointment_date: date, notes: notes || null,
      start_time: startTime || null, end_time: endTime || null
    })
    return { success: true }
  },

  async remove(id) {
    await deleteDoc(doc(db, 'appointments', id))
    return { success: true }
  },

  async markEntered(id, value, consultationFee) {
    const update = { entered: value ? 1 : 0, missed: 0 }
    if (consultationFee !== undefined) update.consultation_fee = consultationFee
    await updateDoc(doc(db, 'appointments', id), update)
    return { success: true }
  },

  async markMissed(id, value) {
    await updateDoc(doc(db, 'appointments', id), { missed: value ? 1 : 0, entered: 0 })
    return { success: true }
  },

  async setPaymentStatus(clinicId, id, status, amount) {
    if (status === 'review') {
      const check = await this.checkReviewEligibility(clinicId, id)
      if (!check.eligible) return { success: false, reason: 'review_expired', ...check }
    }
    const finalAmount = (status === 'paid' || status === 'review') ? Number(amount) || 0 : null
    await updateDoc(doc(db, 'appointments', id), { payment_status: status || null, amount: finalAmount })
    return { success: true }
  },

  async checkReviewEligibility(clinicId, appointmentId) {
    const appt = await this.get(appointmentId)
    if (!appt) return { eligible: true }
    const genSnap = await getDocs(query(collection(db, 'general_settings'), where('clinicId', '==', clinicId)))
    const genSettings = genSnap.docs[0]?.data()
    const reviewDays = genSettings ? Number(genSettings.review_days) : 0
    if (!reviewDays) return { eligible: true }

    const allSnap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId), where('patient_id', '==', appt.patient_id)))
    const paidAppts = allSnap.docs.map(d => d.data()).filter(a => a.payment_status === 'paid').sort((a, b) => b.appointment_date.localeCompare(a.appointment_date))
    const lastPaid = paidAppts[0]
    if (!lastPaid) return { eligible: true }

    const [y1, m1, d1] = lastPaid.appointment_date.split('-').map(Number)
    const [y2, m2, d2] = appt.appointment_date.split('-').map(Number)
    const daysElapsed = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000)
    return { eligible: daysElapsed < reviewDays, reviewDays, lastPaidDate: lastPaid.appointment_date, daysElapsed }
  },

  async createWalkIn(clinicId, fullName, phone) {
    validateClinicAccess(clinicId)
    const trimmedName = fullName.trim()
    const existingSnap = await getDocs(query(collection(db, 'patients'), where('clinicId', '==', clinicId), where('full_name', '==', trimmedName)))
    let patientId
    let usedExisting = false
    if (!existingSnap.empty) {
      patientId = existingSnap.docs[0].id
      usedExisting = true
    } else {
      const ref = await addDoc(collection(db, 'patients'), {
        clinicId, full_name: trimmedName, phone: phone || null, is_walkin: 1,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
      patientId = ref.id
    }
    await addDoc(collection(db, 'appointments'), {
      clinicId, patient_id: patientId, appointment_date: todayIso(),
      entered: 0, missed: 0, payment_status: null, amount: null, notes: null,
      created_at: new Date().toISOString()
    })
    return { success: true, usedExisting }
  }
}

// ===== التشخيصات =====
export const diagnosesRepo = {
  async get(clinicId, appointmentId) {
    const snap = await getDocs(query(collection(db, 'diagnoses'), where('clinicId', '==', clinicId), where('appointment_id', '==', appointmentId)))
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async save(clinicId, appointmentId, patientId, content) {
    const existing = await this.get(clinicId, appointmentId)
    if (existing) {
      await updateDoc(doc(db, 'diagnoses', existing.id), { content, updated_at: new Date().toISOString() })
    } else {
      await addDoc(collection(db, 'diagnoses'), {
        clinicId, appointment_id: appointmentId, patient_id: patientId, content,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
    }
    return await this.get(clinicId, appointmentId)
  },

  async remove(clinicId, appointmentId) {
    const existing = await this.get(clinicId, appointmentId)
    if (existing) await deleteDoc(doc(db, 'diagnoses', existing.id))
    return { success: true }
  },

  async listHistory(clinicId, patientId) {
    const diagSnap = await getDocs(query(collection(db, 'diagnoses'), where('clinicId', '==', clinicId), where('patient_id', '==', patientId)))
    const diagnoses = diagSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    const results = []
    for (const diag of diagnoses) {
      const apptSnap = await getDoc(doc(db, 'appointments', diag.appointment_id))
      const appt = apptSnap.exists() ? apptSnap.data() : {}
      results.push({ ...diag, appointment_date: appt.appointment_date })
    }
    return results.sort((a, b) => (b.appointment_date || '').localeCompare(a.appointment_date || ''))
  }
}

// ===== الوصفات =====
export const prescriptionsRepo = {
  async get(clinicId, appointmentId) {
    const emptySnap = { docs: [], empty: true }
    const snap1 = await getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId), where('appointment_id', '==', appointmentId))).catch(() => emptySnap)
    if (!snap1.empty) return { id: snap1.docs[0].id, ...snap1.docs[0].data() }
    const snap2 = await getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId), where('appointmentId', '==', appointmentId))).catch(() => emptySnap)
    if (!snap2.empty) return { id: snap2.docs[0].id, ...snap2.docs[0].data() }
    return null
  },

  async save(clinicId, appointmentId, patientId, content, extra) {
    const existing = await this.get(clinicId, appointmentId)
    if (existing) {
      await updateDoc(doc(db, 'prescriptions', existing.id), { content, updated_at: new Date().toISOString() })
    } else {
      await addDoc(collection(db, 'prescriptions'), {
        clinicId, appointment_id: appointmentId, patient_id: patientId,
        content, ...(extra || {}),
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
    }
    return await this.get(clinicId, appointmentId)
  },

  async listHistory(clinicId, patientId) {
    const emptySnap = { docs: [], empty: true }
    const snap1 = await getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId), where('patient_id', '==', patientId))).catch(() => emptySnap)
    const snap2 = await getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId), where('patientId', '==', patientId))).catch(() => emptySnap)
    const seen = new Set()
    const all = []
    for (const d of [...snap1.docs, ...snap2.docs]) {
      if (!seen.has(d.id)) { seen.add(d.id); all.push({ id: d.id, ...d.data() }) }
    }
    const results = []
    for (const presc of all) {
      const apptSnap = await getDoc(doc(db, 'appointments', presc.appointment_id)).catch(() => null)
      const appt = apptSnap?.exists() ? apptSnap.data() : {}
      results.push({ ...presc, appointment_date: appt.appointment_date })
    }
    return results.sort((a, b) => (b.appointment_date || b.created_at || '').localeCompare(a.appointment_date || a.created_at || ''))
  },

  async remove(clinicId, appointmentId) {
    const existing = await this.get(clinicId, appointmentId)
    if (existing) await deleteDoc(doc(db, 'prescriptions', existing.id))
    return { success: true }
  }
}

// ===== تقارير المرضى =====
export const reportsRepo = {
  async get(clinicId, patientId) {
    const snap = await getDocs(query(collection(db, 'patient_reports'), where('clinicId', '==', clinicId), where('patient_id', '==', patientId)))
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async save(clinicId, patientId, content) {
    const existing = await this.get(clinicId, patientId)
    if (existing) {
      await updateDoc(doc(db, 'patient_reports', existing.id), { content, updated_at: new Date().toISOString() })
    } else {
      await addDoc(collection(db, 'patient_reports'), {
        clinicId, patient_id: patientId, content,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
    }
    return await this.get(clinicId, patientId)
  },

  async remove(clinicId, patientId) {
    const existing = await this.get(clinicId, patientId)
    if (existing) await deleteDoc(doc(db, 'patient_reports', existing.id))
    return { success: true }
  }
}

// ===== الأقساط =====
export const installmentsRepo = {
  async listPatientsForBilling(clinicId, searchTerm) {
    const instSnap = await getDocs(query(collection(db, 'installments'), where('clinicId', '==', clinicId)))
    const patientIds = [...new Set(instSnap.docs.map(d => d.data().patient_id))]
    const patients = []
    for (const pid of patientIds) {
      const p = await patientsRepo.get(pid)
      if (p) patients.push(p)
    }
    let result = patients
    if (searchTerm && searchTerm.trim()) {
      const t = searchTerm.trim().toLowerCase()
      result = result.filter(p =>
        (p.full_name || '').toLowerCase().includes(t) ||
        (p.phone || '').includes(t) ||
        (p.file_number || '').includes(t)
      )
    }
    return result.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '', 'ar'))
  },

  async enroll(clinicId, patientId) {
    const snap = await getDocs(query(collection(db, 'installments'), where('patient_id', '==', patientId)))
    if (snap.empty) {
      await addDoc(collection(db, 'installments'), {
        clinicId, patient_id: patientId, total_amount: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
    }
  },

  async unenroll(patientId) {
    const snap = await getDocs(query(collection(db, 'installments'), where('patient_id', '==', patientId)))
    for (const d of snap.docs) {
      const paySnap = await getDocs(query(collection(db, 'installment_payments'), where('installment_id', '==', d.id)))
      for (const p of paySnap.docs) { await deleteDoc(doc(db, 'installment_payments', p.id)) }
      await deleteDoc(doc(db, 'installments', d.id))
    }
  },

  async getByPatient(patientId) {
    const snap = await getDocs(query(collection(db, 'installments'), where('patient_id', '==', patientId)))
    if (snap.empty) return null
    const inst = { id: snap.docs[0].id, ...snap.docs[0].data() }
    const paySnap = await getDocs(query(collection(db, 'installment_payments'), where('installment_id', '==', inst.id), orderBy('id', 'asc')))
    inst.payments = paySnap.docs.map(d => ({ id: d.id, ...d.data() }))
    return inst
  },

  async setTotal(patientId, totalAmount) {
    const snap = await getDocs(query(collection(db, 'installments'), where('patient_id', '==', patientId)))
    if (!snap.empty) {
      await updateDoc(doc(db, 'installments', snap.docs[0].id), {
        total_amount: Number(totalAmount) || 0, updated_at: new Date().toISOString()
      })
    }
    return await this.getByPatient(patientId)
  },

  async addPayment(clinicId, patientId, amount) {
    let snap = await getDocs(query(collection(db, 'installments'), where('patient_id', '==', patientId)))
    let instId
    if (snap.empty) {
      const ref = await addDoc(collection(db, 'installments'), {
        clinicId, patient_id: patientId, total_amount: 0,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString()
      })
      instId = ref.id
    } else {
      instId = snap.docs[0].id
    }
    await addDoc(collection(db, 'installment_payments'), {
      clinicId, installment_id: instId, amount: Number(amount) || 0,
      payment_date: todayIso(), created_at: new Date().toISOString()
    })
    return await this.getByPatient(patientId)
  },

  async deletePayment(installmentId, patientId, paymentId) {
    await deleteDoc(doc(db, 'installment_payments', paymentId))
    return await this.getByPatient(patientId)
  }
}

// ===== المصروفات =====
export const expensesRepo = {
  async list(clinicId, date) {
    const targetDate = date || todayIso()
    const snap = await getDocs(query(collection(db, 'expenses'), where('clinicId', '==', clinicId), where('expense_date', '==', targetDate)))
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.id || '').localeCompare(b.id || ''))
  },

  async add(clinicId, amount, description, date) {
    validateClinicAccess(clinicId)
    const targetDate = date || todayIso()
    await addDoc(collection(db, 'expenses'), {
      clinicId, amount: Number(amount) || 0, description: description || null,
      expense_date: targetDate, created_at: new Date().toISOString()
    })
    return await this.list(clinicId, targetDate)
  },

  async remove(clinicId, id, date) {
    await deleteDoc(doc(db, 'expenses', id))
    return await this.list(clinicId, date)
  },

  async getTotalForRange(clinicId, startDate, endDate) {
    const snap = await getDocs(query(collection(db, 'expenses'), where('clinicId', '==', clinicId)))
    return snap.docs.reduce((sum, d) => {
      const dt = d.data()
      if (dt.expense_date >= startDate && dt.expense_date < endDate) return sum + (Number(dt.amount) || 0)
      return sum
    }, 0)
  }
}

// ===== الدخل من الحجوزات =====
export const incomeRepo = {
  async getForRange(clinicId, startDate, endDate) {
    const snap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', clinicId)))
    return snap.docs.reduce((sum, d) => {
      const dt = d.data()
      if (dt.appointment_date >= startDate && dt.appointment_date < endDate) {
        if (dt.entered === 1 && dt.consultation_fee) {
          return sum + (Number(dt.consultation_fee) || 0)
        }
        if (dt.payment_status === 'paid' || dt.payment_status === 'review') {
          return sum + (Number(dt.amount) || 0)
        }
      }
      return sum
    }, 0)
  },

  async getTodaySummary(clinicId, date) {
    const targetDate = date || todayIso()
    const end = nextDayIso(targetDate)
    const income = await this.getForRange(clinicId, targetDate, end)
    const expenses = await expensesRepo.getTotalForRange(clinicId, targetDate, end)
    return { date: targetDate, income, expenses, net: income - expenses }
  },

  async getDailyBreakdown(clinicId, startDate, endDate) {
    const days = []
    let cursor = startDate
    while (cursor < endDate) {
      const dayEnd = nextDayIso(cursor)
      const dayIncome = await this.getForRange(clinicId, cursor, dayEnd)
      const dayExpenses = await expensesRepo.getTotalForRange(clinicId, cursor, dayEnd)
      days.push({ date: cursor, income: dayIncome, expenses: dayExpenses, net: dayIncome - dayExpenses })
      cursor = dayEnd
    }
    return days
  },

  async getWeeklyReport(clinicId, referenceIso) {
    const ref = referenceIso || todayIso()
    const [y, m, d] = ref.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const offset = (dt.getDay() - 6 + 7) % 7
    const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - offset)
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7)
    const startIso = isoFromParts(start.getFullYear(), start.getMonth(), start.getDate())
    const endIso = isoFromParts(end.getFullYear(), end.getMonth(), end.getDate())
    const income = await this.getForRange(clinicId, startIso, endIso)
    const expenses = await expensesRepo.getTotalForRange(clinicId, startIso, endIso)
    const days = await this.getDailyBreakdown(clinicId, startIso, endIso)
    return { start: startIso, end: endIso, income, expenses, net: income - expenses, days }
  },

  async getMonthlyReport(clinicId, year, month) {
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 1)
    const startIso = isoFromParts(start.getFullYear(), start.getMonth(), start.getDate())
    const endIso = isoFromParts(end.getFullYear(), end.getMonth(), end.getDate())
    const income = await this.getForRange(clinicId, startIso, endIso)
    const expenses = await expensesRepo.getTotalForRange(clinicId, startIso, endIso)
    const days = await this.getDailyBreakdown(clinicId, startIso, endIso)
    return { start: startIso, end: endIso, income, expenses, net: income - expenses, days }
  },

  async getAnnualReport(clinicId, year) {
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)
    const startIso = isoFromParts(start.getFullYear(), start.getMonth(), start.getDate())
    const endIso = isoFromParts(end.getFullYear(), end.getMonth(), end.getDate())
    const income = await this.getForRange(clinicId, startIso, endIso)
    const expenses = await expensesRepo.getTotalForRange(clinicId, startIso, endIso)
    const months = []
    for (let m = 0; m < 12; m++) {
      const ms = new Date(year, m, 1)
      const me = new Date(year, m + 1, 1)
      const mStartIso = isoFromParts(ms.getFullYear(), ms.getMonth(), ms.getDate())
      const mEndIso = isoFromParts(me.getFullYear(), me.getMonth(), me.getDate())
      const mIncome = await this.getForRange(clinicId, mStartIso, mEndIso)
      const mExpenses = await expensesRepo.getTotalForRange(clinicId, mStartIso, mEndIso)
      months.push({ year, month: m, income: mIncome, expenses: mExpenses, net: mIncome - mExpenses })
    }
    return { start: startIso, end: endIso, income, expenses, net: income - expenses, months }
  }
}

// ===== الإعدادات =====
export const settingsRepo = {
  async getDoctorInfo(clinicId) {
    const snap = await getDocs(query(collection(db, 'doctor_settings'), where('clinicId', '==', clinicId)))
    if (snap.empty) return { clinic_name: '', doctor_name: '', doctor_bio: '', clinic_address: '', phone1: '', phone2: '' }
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async setDoctorInfo(clinicId, data) {
    validateClinicAccess(clinicId)
    const snap = await getDocs(query(collection(db, 'doctor_settings'), where('clinicId', '==', clinicId)))
    if (!snap.empty) {
      await updateDoc(doc(db, 'doctor_settings', snap.docs[0].id), data)
    } else {
      await addDoc(collection(db, 'doctor_settings'), { clinicId, ...data })
    }
    return data
  },

  async getGeneralSettings(clinicId) {
    const snap = await getDocs(query(collection(db, 'general_settings'), where('clinicId', '==', clinicId)))
    if (snap.empty) return { review_days: 0 }
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async setGeneralSettings(clinicId, reviewDays) {
    validateClinicAccess(clinicId)
    const snap = await getDocs(query(collection(db, 'general_settings'), where('clinicId', '==', clinicId)))
    const data = { review_days: Number(reviewDays) || 0 }
    if (!snap.empty) {
      await updateDoc(doc(db, 'general_settings', snap.docs[0].id), data)
    } else {
      await addDoc(collection(db, 'general_settings'), { clinicId, ...data })
    }
    return data
  },

  async getFeeSettings(clinicId) {
    const snap = await getDocs(query(collection(db, 'fee_settings'), where('clinicId', '==', clinicId)))
    if (snap.empty) return { exam_fee: 0, review_fee: 0 }
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async setFeeSettings(clinicId, examFee, reviewFee) {
    validateClinicAccess(clinicId)
    const snap = await getDocs(query(collection(db, 'fee_settings'), where('clinicId', '==', clinicId)))
    const data = { exam_fee: Number(examFee) || 0, review_fee: Number(reviewFee) || 0 }
    if (!snap.empty) {
      await updateDoc(doc(db, 'fee_settings', snap.docs[0].id), data)
    } else {
      await addDoc(collection(db, 'fee_settings'), { clinicId, ...data })
    }
    return data
  }
}

// ===== وضع الصيانة =====
export async function getMaintenanceMode() {
  const snap = await getDoc(doc(db, 'platform_settings', 'maintenance'))
  if (!snap.exists()) return { enabled: false, message: '' }
  const data = snap.data()
  return { enabled: data.enabled || false, message: data.message || '', updatedAt: data.updatedAt || null }
}

// ===== النسخ الاحتياطي (تصدير/استيراد JSON من Firebase) =====
export const backupRepo = {
  async exportAll(clinicId) {
    validateClinicAccess(clinicId)
    const collections = ['patients', 'appointments', 'diagnoses', 'prescriptions', 'installments', 'installment_payments', 'expenses', 'doctor_settings', 'general_settings', 'patient_reports', 'fee_settings']
    const data = {}
    for (const col of collections) {
      const snap = await getDocs(query(collection(db, col), where('clinicId', '==', clinicId)))
      data[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    return data
  },

  async importAll(clinicId, data) {
    validateClinicAccess(clinicId)
    const allowedCollections = ['patients', 'appointments', 'diagnoses', 'prescriptions', 'installments', 'installment_payments', 'expenses', 'doctor_settings', 'general_settings', 'patient_reports', 'fee_settings']
    for (const [colName, docs] of Object.entries(data)) {
      if (!allowedCollections.includes(colName)) continue
      for (const docData of docs) {
        const { id, ...rest } = docData
        await addDoc(collection(db, colName), { ...rest, clinicId })
      }
    }
    return { success: true }
  }
}

// ===== الملف العام للطبيب =====
export const doctorProfilesRepo = {
  async getByClinic(clinicId) {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    if (snap.empty) return null
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async save(clinicId, data) {
    validateClinicAccess(clinicId)
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    const payload = { clinicId, ...data, updated_at: new Date().toISOString() }
    if (!snap.empty) {
      await updateDoc(doc(db, 'doctor_profiles', snap.docs[0].id), payload)
      return { id: snap.docs[0].id, ...payload }
    } else {
      const ref = await addDoc(collection(db, 'doctor_profiles'), { ...payload, created_at: new Date().toISOString() })
      return { id: ref.id, ...payload }
    }
  },

  async listPublic() {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('is_public', '==', true)))
    const profiles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const doctorSettings = await getDocs(query(collection(db, 'doctor_settings')))
    const dsMap = {}
    doctorSettings.docs.forEach(d => { const data = d.data(); if (data.clinicId) dsMap[data.clinicId] = data })
    return profiles.map(p => ({
      ...p,
      clinic_name: p.clinic_name || dsMap[p.clinicId]?.clinic_name || '',
      doctor_name: p.doctor_name || dsMap[p.clinicId]?.doctor_name || '',
      doctor_bio: p.doctor_bio || dsMap[p.clinicId]?.doctor_bio || '',
      photoUrl: p.photoUrl || dsMap[p.clinicId]?.photoUrl || '',
      clinic_address: p.clinic_address || dsMap[p.clinicId]?.clinic_address || '',
      phone1: p.phone1 || dsMap[p.clinicId]?.phone1 || '',
      phone2: p.phone2 || dsMap[p.clinicId]?.phone2 || '',
      whatsapp: p.whatsapp || dsMap[p.clinicId]?.whatsapp || '',
      consultation_fee: p.consultation_fee || dsMap[p.clinicId]?.consultation_fee || 0,
      area: p.area || dsMap[p.clinicId]?.area || '',
      is_lab: p.is_lab || dsMap[p.clinicId]?.is_lab || false,
      is_hospital: p.is_hospital || dsMap[p.clinicId]?.is_hospital || false,
      offers: p.offers || dsMap[p.clinicId]?.offers || [],
      weekly_schedule: p.weekly_schedule || dsMap[p.clinicId]?.weekly_schedule || [],
      view_count: p.view_count || 0,
      verified: p.verified || false,
      rating_avg: p.rating_avg || 0,
      rating_count: p.rating_count || 0,
      clinic_open_time: p.clinic_open_time || dsMap[p.clinicId]?.clinic_open_time || '',
      clinic_close_time: p.clinic_close_time || dsMap[p.clinicId]?.clinic_close_time || ''
    }))
  },

  async incrementView(clinicId) {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    if (!snap.empty) {
      const ref = doc(db, 'doctor_profiles', snap.docs[0].id)
      await updateDoc(ref, { view_count: increment(1) })
    }
  },

  async adminSetRating(clinicId, rating, count) {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    if (!snap.empty) {
      await updateDoc(doc(db, 'doctor_profiles', snap.docs[0].id), {
        rating_avg: Math.round(Number(rating) * 10) / 10,
        rating_count: Number(count) || 0
      })
      return { success: true }
    }
    return { success: false, error: 'Profile not found' }
  },

  async adminToggleTopRated(clinicId, isTopRated) {
    const snap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    if (!snap.empty) {
      await updateDoc(doc(db, 'doctor_profiles', snap.docs[0].id), {
        top_rated: !!isTopRated
      })
      return { success: true }
    }
    return { success: false, error: 'Profile not found' }
  },

  async getDirectorySettings() {
    const snap = await getDocs(query(collection(db, 'directory_settings')))
    if (snap.empty) return {}
    return { id: snap.docs[0].id, ...snap.docs[0].data() }
  },

  async saveDirectorySettings(data) {
    const snap = await getDocs(query(collection(db, 'directory_settings')))
    if (!snap.empty) {
      await updateDoc(doc(db, 'directory_settings', snap.docs[0].id), { ...data, updated_at: new Date().toISOString() })
      return { id: snap.docs[0].id, ...data }
    } else {
      const ref = await addDoc(collection(db, 'directory_settings'), { ...data, created_at: new Date().toISOString() })
      return { id: ref.id, ...data }
    }
  },

  async listAllProfiles() {
    const snap = await getDocs(collection(db, 'doctor_profiles'))
    const profiles = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    const doctorSettings = await getDocs(query(collection(db, 'doctor_settings')))
    const dsMap = {}
    doctorSettings.docs.forEach(d => { const data = d.data(); if (data.clinicId) dsMap[data.clinicId] = data })
    return profiles.map(p => ({
      ...p,
      clinic_name: p.clinic_name || dsMap[p.clinicId]?.clinic_name || '',
      doctor_name: p.doctor_name || dsMap[p.clinicId]?.doctor_name || '',
      doctor_bio: p.doctor_bio || dsMap[p.clinicId]?.doctor_bio || '',
      photoUrl: p.photoUrl || dsMap[p.clinicId]?.photoUrl || '',
      clinic_address: p.clinic_address || dsMap[p.clinicId]?.clinic_address || '',
      phone1: p.phone1 || dsMap[p.clinicId]?.phone1 || '',
      phone2: p.phone2 || dsMap[p.clinicId]?.phone2 || '',
      whatsapp: p.whatsapp || dsMap[p.clinicId]?.whatsapp || '',
      consultation_fee: p.consultation_fee || dsMap[p.clinicId]?.consultation_fee || 0,
      area: p.area || dsMap[p.clinicId]?.area || '',
      is_lab: p.is_lab || dsMap[p.clinicId]?.is_lab || false,
      is_hospital: p.is_hospital || dsMap[p.clinicId]?.is_hospital || false,
      offers: p.offers || dsMap[p.clinicId]?.offers || [],
      weekly_schedule: p.weekly_schedule || dsMap[p.clinicId]?.weekly_schedule || [],
      view_count: p.view_count || 0,
      verified: p.verified || false,
      rating_avg: p.rating_avg || 0,
      rating_count: p.rating_count || 0,
      top_rated: p.top_rated || false,
      is_public: p.is_public || false,
      created_at: p.created_at || null,
      updated_at: p.updated_at || null
    }))
  }
}

// ===== التقييمات والشهادات =====
export const reviewsRepo = {
  async listByClinic(clinicId, approvedOnly = true) {
    let q = query(collection(db, 'reviews'), where('clinicId', '==', clinicId))
    if (approvedOnly) q = query(collection(db, 'reviews'), where('clinicId', '==', clinicId), where('is_approved', '==', true))
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  },

  _isSpamComment(text) {
    if (!text || !text.trim()) return true
    const t = text.trim()
    if (/^\d+$/.test(t)) return true
    if (/(.)\1{3,}/.test(t)) return true
    if (/^[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9\s.,!?؟،!]+$/.test(t) && t.length < 3) return true
    const spamPatterns = ['اشتراك', 'متابع', 'لايك', 'follow', 'subscribe', 'check my', 'visit my', 'click here']
    if (spamPatterns.some(p => t.toLowerCase().includes(p))) return true
    return false
  },

  async add(clinicId, data) {
    const comment = data.comment || ''
    if (this._isSpamComment(comment)) {
      return { id: null, error: 'spam_rejected', message: 'تم رفض التعليق بسبب محتوى غير مناسب.' }
    }
    const patientName = data.patient_name || 'مجهول'
    const existingSnap = await getDocs(
      query(collection(db, 'reviews'), where('clinicId', '==', clinicId), where('patient_name', '==', patientName))
    )
    if (!existingSnap.empty) {
      const existingReview = existingSnap.docs[0]
      const existingData = existingReview.data()
      await addDoc(collection(db, 'review_comments'), {
        clinicId,
        review_id: existingReview.id,
        patient_name: patientName,
        comment,
        created_at: new Date().toISOString()
      })
      return { id: existingReview.id, added_comment: true }
    }
    const ref = await addDoc(collection(db, 'reviews'), {
      clinicId,
      patient_name: patientName,
      rating: Number(data.rating) || 5,
      comment,
      reply: null,
      is_approved: true,
      device_fingerprint: data.device_fingerprint || null,
      created_at: new Date().toISOString()
    })
    await this._updateStats(clinicId)
    return { id: ref.id }
  },

  async reply(reviewId, clinicId, replyText) {
    await updateDoc(doc(db, 'reviews', reviewId), { reply: replyText })
    return { success: true }
  },

  async approve(reviewId, clinicId, approved) {
    await updateDoc(doc(db, 'reviews', reviewId), { is_approved: approved })
    await this._updateStats(clinicId)
    return { success: true }
  },

  async _updateStats(clinicId) {
    const all = await this.listByClinic(clinicId, false)
    const approved = all.filter(r => r.is_approved)
    const avg = approved.length ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length) : 0
    const profileSnap = await getDocs(query(collection(db, 'doctor_profiles'), where('clinicId', '==', clinicId)))
    if (!profileSnap.empty) {
      await updateDoc(doc(db, 'doctor_profiles', profileSnap.docs[0].id), {
        rating_avg: Math.round(avg * 10) / 10,
        rating_count: approved.length
      })
    }
  }
}

// ===== دليل الأطباء غير المشتركين =====
export const directoryListingsRepo = {
  _collection: 'directory_listings',

  async listPublic() {
    const snap = await getDocs(collection(db, this._collection))
    return snap.docs.map(d => {
      const data = d.data()
      return {
        id: d.id,
        ...data,
        is_directory_listing: true,
        is_subscribed: false,
        doctor_name: data.doctor_name || '',
        specialty: data.specialty || '',
        governorate: data.governorate || '',
        area: data.area || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        photoUrl: data.photoUrl || '',
        address: data.address || '',
        view_count: data.view_count || 0,
        rating_avg: data.rating_avg || 0,
        rating_count: data.rating_count || 0,
        created_at: data.created_at || null
      }
    }).sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  },

  async listAll() {
    return await this.listPublic()
  },

  async add(data) {
    const ref = await addDoc(collection(db, this._collection), {
      facility_type: data.facility_type || 'doctor',
      doctor_name: data.doctor_name || '',
      specialty: data.specialty || '',
      governorate: data.governorate || '',
      area: data.area || '',
      phone: data.phone || '',
      phone2: data.phone2 || '',
      whatsapp: data.whatsapp || '',
      website: data.website || '',
      photoUrl: data.photoUrl || '',
      address: data.address || '',
      map_url: data.map_url || '',
      doctor_bio: data.doctor_bio || '',
      is_24h: data.is_24h || false,
      clinic_open_time: data.clinic_open_time || '',
      clinic_close_time: data.clinic_close_time || '',
      view_count: 0,
      rating_avg: 0,
      rating_count: 0,
      enabled: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    return { id: ref.id }
  },

  async update(id, data) {
    await updateDoc(doc(db, this._collection, id), {
      ...data,
      updated_at: new Date().toISOString()
    })
    return { success: true }
  },

  async remove(id) {
    await deleteDoc(doc(db, this._collection, id))
    return { success: true }
  },

  async incrementView(id) {
    try {
      await updateDoc(doc(db, this._collection, id), {
        view_count: increment(1)
      })
    } catch {}
  }
}

// ===== سجل العمليات =====
export const auditLogsRepo = {
  async log(clinicId, action, details) {
    validateClinicAccess(clinicId)
    const store = getAuthStore()
    await addDoc(collection(db, 'audit_logs'), {
      clinicId,
      action,
      details: details || null,
      user_name: store?.fullName || 'مدير النظام',
      timestamp: new Date().toISOString()
    })
  },

  async list(clinicId, limitCount = 50) {
    const snap = await getDocs(
      query(collection(db, 'audit_logs'), where('clinicId', '==', clinicId), orderBy('timestamp', 'desc'))
    )
    return snap.docs.slice(0, limitCount).map(d => ({ id: d.id, ...d.data() }))
  },

  async listByDate(clinicId, date) {
    const snap = await getDocs(
      query(collection(db, 'audit_logs'), where('clinicId', '==', clinicId))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .filter(log => log.timestamp && log.timestamp.startsWith(date))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
  },

  async getDailyStats(clinicId, date) {
    const logs = await this.listByDate(clinicId, date)
    const actionCounts = {}
    logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1 })
    return { total: logs.length, actionCounts, logs }
  }
}

// ===== مستندات المرضى =====
export const patientDocsRepo = {
  async list(clinicId, patientId) {
    const snap = await getDocs(
      query(collection(db, 'patient_documents'), where('clinicId', '==', clinicId), where('patient_id', '==', patientId), orderBy('created_at', 'desc'))
    )
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  },

  async add(clinicId, patientId, data) {
    validateClinicAccess(clinicId)
    const store = getAuthStore()
    const docRef = await addDoc(collection(db, 'patient_documents'), {
      clinicId,
      patient_id: patientId,
      title: data.title || '',
      description: data.description || '',
      file_url: data.file_url || '',
      file_type: data.file_type || 'image',
      added_by: store?.fullName || 'المدير',
      created_at: new Date().toISOString()
    })
    return { id: docRef.id }
  },

  async remove(docId) {
    await deleteDoc(doc(db, 'patient_documents', docId))
    return { success: true }
  },

  async getByPatient(clinicId, patientId) {
    return await this.list(clinicId, patientId)
  }
}
