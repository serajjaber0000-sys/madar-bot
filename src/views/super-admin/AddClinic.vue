<template>
  <AppLayout>
    <div class="add-clinic-page">
      <header class="page-header">
        <div>
          <h1>{{ t.addClinic }}</h1>
          <p class="subtitle">{{ t.tagline }}</p>
        </div>
        <router-link to="/super-admin/clinics" class="btn-back">{{ t.backToList }}</router-link>
      </header>

      <form v-if="!success" class="form-card" @submit.prevent="handleAdd">
        <div class="form-grid">
          <div class="form-group">
            <label>{{ t.clinicName }} *</label>
            <input type="text" v-model="form.name" placeholder="سمايل دنتال" required @input="generateCredentials" />
          </div>
          <div class="form-group">
            <label>{{ t.ownerName }} *</label>
            <input type="text" v-model="form.ownerName" placeholder="د. أحمد" required />
          </div>
          <div class="form-group">
            <label>{{ t.phone }} *</label>
            <input type="tel" v-model="form.phone" placeholder="0780xxxxxxx" required />
          </div>
          <div class="form-group">
            <label>{{ t.plan }} *</label>
            <select v-model="form.plan" required>
              <option value="basic">{{ t.basic }}</option>
              <option value="premium">{{ t.premium }}</option>
              <option value="enterprise">{{ t.enterprise }}</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>{{ t.address }}</label>
            <input type="text" v-model="form.address" placeholder="عنوان العيادة" />
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

        <div v-if="generatedEmail" class="credentials-preview">
          <h3>{{ t.credentialsGenerated }}</h3>
          <div class="cred-row">
            <span class="cred-label">{{ t.emailLabel }}</span>
            <span class="cred-value">{{ generatedEmail }}</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">{{ t.passwordLabel }}</span>
            <span class="cred-value">{{ generatedPassword }}</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? t.loading : t.createClinicAndAccount }}
          </button>
          <router-link to="/super-admin/clinics" class="btn-cancel">{{ t.cancel }}</router-link>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>
      </form>

      <div v-else class="success-card">
        <div class="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2>{{ t.clinicCreatedSuccess }}</h2>
        <div class="credentials-box">
          <h3>{{ t.loginCredentials }}</h3>
          <div class="cred-row">
            <span class="cred-label">{{ t.emailLabel }}</span>
            <span class="cred-value select-all">{{ generatedEmail }}</span>
          </div>
          <div class="cred-row">
            <span class="cred-label">{{ t.passwordLabel }}</span>
            <span class="cred-value select-all">{{ generatedPassword }}</span>
          </div>
          <button class="btn-copy" @click="copyCredentials">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            {{ copied ? t.copied : t.copyCredentials }}
          </button>
        </div>
        <router-link to="/super-admin/clinics" class="btn-done">{{ t.backToClinics }}</router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { db, secondaryAuth } from '@/firebase/config'
import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useI18n } from '@/composables/useI18n'
import { uploadToImgBB } from '@/composables/useImgBB'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const success = ref(false)
const copied = ref(false)
const generatedEmail = ref('')
const generatedPassword = ref('')
const imageUrl = ref('')
const fileInput = ref(null)

const form = ref({
  name: '',
  ownerName: '',
  phone: '',
  address: '',
  plan: 'basic'
})

function generateSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10)
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 10; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length))
  return pass
}

function generateCredentials() {
  if (!form.value.name) return
  const slug = generateSlug(form.value.name)
  generatedEmail.value = `${slug}@dotor.com`
  generatedPassword.value = generatePassword()
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleImageUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    imageUrl.value = await uploadToImgBB(file)
  } catch (err) {
    error.value = 'فشل في رفع الصورة'
  }
}

const handleAdd = async () => {
  loading.value = true
  error.value = ''

  if (!generatedEmail.value) generateCredentials()

  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      generatedEmail.value,
      generatedPassword.value
    )
    const uid = cred.user.uid

    await setDoc(doc(db, 'users', uid), {
      fullName: form.value.ownerName,
      email: generatedEmail.value,
      phone: form.value.phone,
      role: 'owner',
      clinicId: '',
      photoUrl: imageUrl.value || '',
      createdAt: new Date().toISOString()
    })

    const clinicRef = await addDoc(collection(db, 'clinics'), {
      name: form.value.name,
      ownerName: form.value.ownerName,
      ownerUid: uid,
      email: generatedEmail.value,
      phone: form.value.phone,
      address: form.value.address,
      plan: form.value.plan,
      photoUrl: imageUrl.value || '',
      status: 'active',
      patientsCount: 0,
      createdAt: new Date().toISOString()
    })

    await setDoc(doc(db, 'users', uid), { clinicId: clinicRef.id }, { merge: true })

    success.value = true
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      error.value = 'البريد موجود - جرب اسم مختلف'
      generateCredentials()
    } else {
      error.value = err.message || 'Failed'
    }
  } finally {
    loading.value = false
  }
}

function copyCredentials() {
  const text = `مدار - تسجيل الدخول:\nالبريد: ${generatedEmail.value}\nكلمة المرور: ${generatedPassword.value}`
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>

<style scoped>
.add-clinic-page { padding: 24px; max-width: 700px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px; }
.page-header h1 { font-size: 1.5rem; font-weight: 800; color: var(--text, #1e293b); margin: 0; }
.subtitle { color: var(--text-muted, #6b7280); font-size: 0.85rem; margin: 4px 0 0; }
.btn-back { display: inline-flex; align-items: center; padding: 8px 16px; background: var(--border, #e5e7eb); color: var(--text, #1e293b); border-radius: 8px; text-decoration: none; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
.btn-back:hover { background: #d1d5db; }
.form-card { background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 16px; padding: 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
.form-group.full-width { grid-column: 1 / -1; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--text, #1e293b); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 10px 14px; border: 1px solid var(--border, #e5e7eb); border-radius: 10px; font-size: 0.9rem; color: var(--text, #1e293b); background: var(--card, #fff); box-sizing: border-box; transition: border-color 0.2s; }
.form-group input:focus, .form-group select:focus { outline: none; border-color: var(--primary, #0A5E52); box-shadow: 0 0 0 3px rgba(10,94,82,0.1); }
.image-upload { width: 100%; height: 140px; border: 2px dashed var(--border, #e5e7eb); border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; transition: border-color 0.2s; }
.image-upload:hover { border-color: var(--primary, #0A5E52); }
.preview-img { width: 100%; height: 100%; object-fit: cover; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-muted, #94A3B8); }
.upload-placeholder span { font-size: 0.82rem; }
.credentials-preview { background: #F0FDFA; border: 1px solid #A7F3D0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.credentials-preview h3 { font-size: 0.9rem; font-weight: 700; color: #065F46; margin: 0 0 12px; }
.cred-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.cred-label { font-size: 0.82rem; font-weight: 600; color: #065F46; min-width: 70px; }
.cred-value { font-size: 0.85rem; font-family: 'IBM Plex Mono', monospace; color: #1a1a2e; background: #fff; padding: 4px 10px; border-radius: 6px; border: 1px solid #D1FAE5; direction: ltr; }
.form-actions { display: flex; gap: 12px; }
.btn-submit { flex: 2; padding: 12px 24px; background: linear-gradient(135deg, #0A5E52, #10B981); color: #fff; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(10,94,82,0.3); }
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(10,94,82,0.4); }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-cancel { flex: 1; padding: 12px 24px; background: var(--border, #e5e7eb); color: var(--text, #1e293b); border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; }
.btn-cancel:hover { background: #d1d5db; }
.error-msg { margin-top: 16px; padding: 12px; background: #FEF2F2; color: #991b1b; border-radius: 10px; text-align: center; font-size: 0.85rem; }
.success-card { background: var(--card, #fff); border: 1px solid var(--border, #e5e7eb); border-radius: 16px; padding: 40px; text-align: center; }
.success-icon { margin-bottom: 16px; }
.success-card h2 { font-size: 1.3rem; font-weight: 800; color: #065F46; margin: 0 0 24px; }
.credentials-box { background: #F0FDFA; border: 1px solid #A7F3D0; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: left; }
.credentials-box h3 { font-size: 0.9rem; font-weight: 700; color: #065F46; margin: 0 0 16px; text-align: center; }
.select-all { user-select: all; }
.btn-copy { display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; padding: 8px 16px; background: #0A5E52; color: #fff; border: none; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.btn-copy:hover { background: #084D44; }
.btn-done { display: inline-flex; align-items: center; padding: 12px 24px; background: #0A5E52; color: #fff; border-radius: 10px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
.btn-done:hover { opacity: 0.9; }
@media (max-width: 768px) { .add-clinic-page { padding: 16px; } .form-grid { grid-template-columns: 1fr; } .form-actions { flex-direction: column; } }
</style>
