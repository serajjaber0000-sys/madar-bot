<template>
  <AppLayout>
    <div class="add-staff-page">
      <header class="page-header">
        <div>
          <h1>{{ t.addStaff }}</h1>
          <p class="subtitle">إضافة سكرتير جديد</p>
        </div>
        <router-link :to="backUrl" class="btn-back">{{ t.backToList }}</router-link>
      </header>

      <form v-if="!success" class="form-card" @submit.prevent="handleAdd">
        <div class="form-grid">
          <div class="form-group">
            <label>{{ t.fullName }} *</label>
            <input type="text" v-model="form.fullName" :placeholder="'سارة أحمد'" required @input="autoGenerateEmail" />
          </div>
          <div class="form-group">
            <label>الدور *</label>
            <select v-model="form.role" required>
              <option value="secretary">سكرتير</option>
            </select>
          </div>
          <div class="form-group">
            <label>البريد الإلكتروني *</label>
            <input type="email" :value="generatedEmail" readonly class="readonly-input" />
            <span class="field-hint">يتم إنشاؤه تلقائياً من الاسم</span>
          </div>
          <div class="form-group">
            <label>كلمة المرور *</label>
            <div class="password-field">
              <input :type="showPassword ? 'text' : 'password'" :value="generatedPassword" readonly class="readonly-input" />
              <button type="button" class="toggle-pass" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>{{ t.phone }}</label>
            <input type="tel" v-model="form.phone" placeholder="07xxxxxxxxx" />
          </div>
          <div class="form-group" v-if="form.role === 'doctor'">
            <label>{{ t.speciality }}</label>
            <input type="text" v-model="form.specialization" :placeholder="'تقويم الأسنان'" />
          </div>
          <div class="form-group">
            <label>{{ t.profileImage }}</label>
            <div class="image-upload" @click="triggerFileInput">
              <img v-if="imageUrl" :src="imageUrl" class="preview-img" />
              <div v-else class="upload-placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span>{{ t.chooseImage }}</span>
              </div>
              <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handleImageUpload" />
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loading">{{ loading ? t.loading : t.add + ' ' + t.staff }}</button>
          <router-link :to="backUrl" class="btn-cancel">{{ t.cancel }}</router-link>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>

      <div v-else class="success-card">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2>تمت الإضافة بنجاح!</h2>
        <p class="success-sub">تم إنشاء حساب المستخدم وكلمة المرور أدناه</p>

        <div v-if="generatedCreds" class="creds-card">
          <div class="creds-row">
            <span class="creds-label">البريد الإلكتروني</span>
            <span class="creds-value">{{ generatedCreds.email }}</span>
            <button class="copy-btn" @click="copyToClipboard(generatedCreds.email)" :title="'نسخ'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <div class="creds-row">
            <span class="creds-label">كلمة المرور</span>
            <span class="creds-value creds-pass">{{ generatedCreds.password }}</span>
            <button class="copy-btn" @click="copyToClipboard(generatedCreds.password)" :title="'نسخ'">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
          <button class="copy-all-btn" @click="copyAllCredentials">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            نسخ كل البيانات
          </button>
        </div>

        <div v-if="copyMsg" class="copy-toast">{{ copyMsg }}</div>

        <div class="success-actions">
          <button class="btn-another" @click="resetForm">إضافة موظف آخر</button>
          <router-link :to="backUrl" class="btn-done">{{ t.backToList }}</router-link>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { db, secondaryAuth } from '@/firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useI18n } from '@/composables/useI18n'
import { uploadToImgBB } from '@/composables/useImgBB'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const clinicId = computed(() => authStore.clinicId)
const backUrl = computed(() => `/clinic/${clinicId.value}/owner/staff`)

const loading = ref(false)
const error = ref('')
const success = ref(false)
const imageUrl = ref('')
const fileInput = ref(null)
const generatedCreds = ref(null)
const showPassword = ref(false)
const copyMsg = ref('')

const form = ref({
  fullName: '',
  role: 'secretary',
  phone: '',
  specialization: ''
})

const generatedEmail = ref('')
const generatedPassword = ref('')

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let pass = ''
  for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
  return pass
}

function autoGenerateEmail() {
  const name = form.value.fullName.trim()
  if (!name) { generatedEmail.value = ''; return }
  const parts = name.split(/\s+/).map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ''))
  if (parts.length >= 2) {
    generatedEmail.value = `${parts[0]}.${parts[parts.length - 1]}@dotor.com`
  } else {
    generatedEmail.value = `${parts[0]}@dotor.com`
  }
}

generatedPassword.value = generatePassword()

function triggerFileInput() { fileInput.value?.click() }

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try { imageUrl.value = await uploadToImgBB(file) }
  catch (err) { }
}

function showToast(msg) {
  copyMsg.value = msg
  setTimeout(() => { copyMsg.value = '' }, 2000)
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    showToast('تم النسخ!')
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showToast('تم النسخ!')
  }
}

function copyAllCredentials() {
  const text = `Email: ${generatedCreds.value.email}\nPassword: ${generatedCreds.value.password}`
  copyToClipboard(text)
}

function resetForm() {
  form.value = { fullName: '', role: 'secretary', phone: '', specialization: '' }
  imageUrl.value = ''
  generatedEmail.value = ''
  generatedPassword.value = generatePassword()
  generatedCreds.value = null
  success.value = false
  error.value = ''
  showPassword.value = false
}

const handleAdd = async () => {
  loading.value = true
  error.value = ''

  const email = generatedEmail.value
  const password = generatedPassword.value

  if (!email) {
    error.value = 'يرجى إدخال الاسم أولاً'
    loading.value = false
    return
  }

  try {
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
    const uid = cred.user.uid

    await setDoc(doc(db, 'users', uid), {
      fullName: form.value.fullName,
      email: email,
      phone: form.value.phone,
      role: form.value.role,
      specialization: form.value.role === 'doctor' ? form.value.specialization : '',
      clinicId: clinicId.value,
      photoUrl: imageUrl.value || '',
      isActive: true,
      createdAt: new Date().toISOString()
    })

    generatedCreds.value = { email, password }
    success.value = true
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'البريد الإلكتروني مستخدم بالفعل'
    } else {
      error.value = err.message || 'Failed'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.add-staff-page { padding: 24px; max-width: 700px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text, #1e293b); margin: 0; }
.subtitle { color: var(--text-muted, #6b7280); font-size: 0.85rem; margin: 4px 0 0; }
.btn-back { display: inline-flex; align-items: center; padding: 8px 16px; background: var(--border, #e5e7eb); color: var(--text, #1e293b); border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; }
.btn-back:hover { background: #d1d5db; }
.form-card { background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 16px; padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border, #e5e7eb); border-radius: 10px; font-size: 0.9rem; color: var(--text, #1e293b); background: var(--card, #fff); box-sizing: border-box; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary, #0A5E52); box-shadow: 0 0 0 3px rgba(10,94,82,0.1); }
.readonly-input { background: #f8fafc !important; color: #475569 !important; cursor: default; }
.field-hint { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; display: block; }
.password-field { display: flex; gap: 0; }
.password-field input { flex: 1; border-start-end-radius: 10px; border-end-end-radius: 10px; }
.toggle-pass { padding: 10px 14px; border: 1px solid var(--border, #e5e7eb); border-inline-start: none; border-start-start-radius: 10px; border-end-start-radius: 10px; background: var(--card, #fff); cursor: pointer; color: #64748b; display: grid; place-items: center; }
.toggle-pass:hover { background: #f1f5f9; }
.image-upload { width: 100%; height: 140px; border: 2px dashed var(--border, #e5e7eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
.image-upload:hover { border-color: var(--primary, #0A5E52); }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted, #94A3B8); }
.upload-placeholder span { font-size: 0.82rem; }
.form-actions { display: flex; gap: 12px; }
.btn-submit { flex: 2; padding: 12px 24px; background: linear-gradient(135deg, #0A5E52, #10B981); color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; }
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { flex: 1; padding: 12px 24px; background: var(--border, #e5e7eb); color: var(--text, #1e293b); border-radius: 10px; font-size: 1rem; font-weight: 600; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; }
.btn-cancel:hover { background: #d1d5db; }
.error-msg { margin-top: 16px; padding: 12px; background: #FEF2F2; color: #991b1b; border-radius: 10px; text-align: center; }
.success-card { background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 16px; padding: 40px; text-align: center; }
.success-icon { margin-bottom: 16px; }
.success-card h2 { font-size: 1.3rem; font-weight: 800; color: #065F46; margin: 0 0 8px; }
.success-sub { font-size: 0.88rem; color: #64748b; margin: 0 0 24px; }
.creds-card { background: #F0FDFA; border: 1px solid #a7f3d0; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: left; }
.creds-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.05); }
.creds-row:last-of-type { border-bottom: none; }
.creds-label { font-size: 0.78rem; font-weight: 600; color: #64748b; min-width: 80px; text-transform: uppercase; letter-spacing: 0.3px; }
.creds-value { font-size: 0.95rem; font-weight: 700; color: #1e293b; flex: 1; word-break: break-all; }
.creds-pass { font-family: 'Courier New', monospace; letter-spacing: 1px; }
.copy-btn { padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; cursor: pointer; color: #64748b; transition: all 0.2s; flex-shrink: 0; }
.copy-btn:hover { background: #f1f5f9; border-color: #0A5E52; color: #0A5E52; }
.copy-all-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 10px 20px; background: linear-gradient(135deg, #0A5E52, #10B981); color: #fff; border: none; border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
.copy-all-btn:hover { transform: translateY(-1px); }
.copy-toast { margin-top: 12px; padding: 8px 16px; background: #1e293b; color: #fff; border-radius: 8px; font-size: 0.82rem; font-weight: 600; display: inline-block; animation: fadeInUp 0.3s ease; }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.success-actions { display: flex; gap: 12px; justify-content: center; margin-top: 16px; }
.btn-another { padding: 12px 24px; background: #fff; border: 2px solid #0A5E52; color: #0A5E52; border-radius: 10px; font-size: 0.95rem; font-weight: 700; cursor: pointer; }
.btn-another:hover { background: #f0fdf9; }
.btn-done { display: inline-flex; padding: 12px 24px; background: #0A5E52; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; }
@media (max-width: 768px) { .add-staff-page { padding: 16px; } .form-grid { grid-template-columns: 1fr; } .form-actions { flex-direction: column; } .success-actions { flex-direction: column; } }
</style>
