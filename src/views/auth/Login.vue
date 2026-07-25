<template>
  <div class="login-page">
    <button class="login-back" @click="$router.back()">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    </button>
    <div class="bg-orbs" aria-hidden="true">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
    </div>

    <div class="login-card">
      <div class="brand-section">
        <div class="logo-wrap">
          <img src="/logo.jpg" alt="مدار" class="brand-logo" />
        </div>
        <h1 class="brand-name">مدار</h1>
        <p class="brand-tagline">نظام إدارة العيادات الطبية</p>
      </div>

      <Transition name="shake">
        <div v-if="error" class="alert-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ error }}</span>
        </div>
      </Transition>

      <form class="login-form" @submit.prevent="login">
        <div class="input-group">
          <label for="email">البريد الإلكتروني</label>
          <div :class="['input-box', { active: focus === 'email' }]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>
            <input id="email" v-model.trim="email" type="email" placeholder="user@clinic.com" @focus="focus='email'" @blur="focus=''" autocomplete="username" required />
          </div>
        </div>

        <div class="input-group">
          <label for="password">كلمة المرور</label>
          <div :class="['input-box', { active: focus === 'password' }]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
            <input id="password" v-model="password" :type="showPass ? 'text' : 'password'" placeholder="••••••••" @focus="focus='password'" @blur="focus=''" autocomplete="current-password" required />
            <button type="button" class="toggle-vis" @click="showPass = !showPass" tabindex="-1">
              <svg v-if="!showPass" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            </button>
          </div>
        </div>

        <label class="remember-label">
          <input type="checkbox" v-model="rememberMe" class="remember-cb" />
          <span class="cb-custom"></span>
          <span>حفظ بيانات الدخول</span>
        </label>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="!loading">تسجيل الدخول</span>
          <div v-else class="loading-row">
            <div class="spinner"></div>
            <span>جاري الدخول...</span>
          </div>
        </button>
      </form>

      <p class="copyright">© {{ new Date().getFullYear() }} مدار — جميع الحقوق محفوظة</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { collection, query, where, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function setAuthUser(data) {
  authStore.setUser(data)
}

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const focus = ref('')
const showPass = ref(false)
const rememberMe = ref(true)

async function login() {
  error.value = ''
  loading.value = true
  try {
    const emailLC = email.value.trim().toLowerCase()
    const passwordVal = password.value

    if (!emailLC || !passwordVal) {
      error.value = 'يرجى إدخال البريد الإلكتروني وكلمة المرور'
      loading.value = false
      return
    }

    const userCredential = await signInWithEmailAndPassword(auth, emailLC, passwordVal)
    const uid = userCredential.user.uid

    const userDocSnap = await getDoc(doc(db, 'users', uid)).catch(() => null)
    const userData = userDocSnap?.exists() ? userDocSnap.data() : null

    if (userData?.role === 'super_admin') {
      setAuthUser({ uid, email: emailLC, role: 'super_admin', clinicId: '' })
      localStorage.setItem('userRole', 'super_admin')
      localStorage.setItem('staffType', 'super_admin')
      localStorage.setItem('displayName', userData.fullName || 'مدير النظام')
      localStorage.setItem('userEmail', emailLC)
      router.replace('/super-admin/dashboard')
      return
    }

    if (userData?.role === 'owner' && userData?.clinicId) {
      setAuthUser({ uid, email: emailLC, role: 'owner', clinicId: userData.clinicId })
      localStorage.setItem('clinicId', userData.clinicId)
      localStorage.setItem('clinicName', userData.clinicName || '')
      localStorage.setItem('staffType', 'owner')
      localStorage.setItem('userRole', 'owner')
      localStorage.setItem('displayName', userData.fullName || '')
      localStorage.setItem('userEmail', emailLC)
      router.replace('/clinic/' + userData.clinicId + '/owner/dashboard')
      return
    }

    if (userData?.role === 'secretary' && userData?.clinicId) {
      setAuthUser({ uid, email: emailLC, role: 'secretary', clinicId: userData.clinicId })
      localStorage.setItem('clinicId', userData.clinicId)
      localStorage.setItem('clinicName', userData.clinicName || '')
      localStorage.setItem('staffType', 'secretary')
      localStorage.setItem('userRole', 'secretary')
      localStorage.setItem('displayName', userData.fullName || '')
      localStorage.setItem('userEmail', emailLC)
      router.replace('/clinic/' + userData.clinicId + '/secretary/dashboard')
      return
    }

    if (!userDocSnap?.exists()) {
      await setDoc(doc(db, 'users', uid), {
        uid, email: emailLC, role: '',
        created_at: new Date().toISOString()
      }).catch(() => {})
    }

    if (rememberMe.value) {
      localStorage.setItem('userToken', uid)
    }

    const staffResults = await getDocs(query(
      collection(db, 'staff'), where('userId', '==', uid)
    )).catch(e => { console.error('Staff query error:', e); return null })

    if (staffResults && !staffResults.empty) {
      const staffData = staffResults.docs[0].data()
      const sRole = staffData.role || 'owner'
      const clinicId = staffData.clinicId || staffData.clinics?.[0]
      if (clinicId) {
        localStorage.setItem('clinicId', clinicId)
        localStorage.setItem('clinicName', staffData.clinicName || '')
        localStorage.setItem('staffId', staffResults.docs[0].id)
        localStorage.setItem('userRole', sRole)
        localStorage.setItem('staffType', sRole)
        localStorage.setItem('displayName', staffData.fullName || staffData.displayName || '')
        localStorage.setItem('userEmail', emailLC)

        await setDoc(doc(db, 'users', uid), {
          uid, email: emailLC, role: sRole, clinicId,
          fullName: staffData.fullName || staffData.displayName || '',
          clinicName: staffData.clinicName || ''
        }, { merge: true }).catch(() => {})

        setAuthUser({ uid, email: emailLC, role: sRole, clinicId })
        router.replace(sRole === 'secretary'
          ? '/clinic/' + clinicId + '/secretary/dashboard'
          : '/clinic/' + clinicId + '/owner/dashboard')
        return
      }
    }

    const clinicResults = await getDocs(query(
      collection(db, 'clinics'), where('ownerUserId', '==', uid)
    )).catch(e => { console.error('Clinics query error:', e); return null })

    if (clinicResults && !clinicResults.empty) {
      const clinicDoc = clinicResults.docs[0]
      const clinicData = clinicDoc.data()
      const clinicId = clinicDoc.id

      localStorage.setItem('clinicId', clinicId)
      localStorage.setItem('clinicName', clinicData.name || '')
      localStorage.setItem('staffType', 'owner')
      localStorage.setItem('userRole', 'owner')
      localStorage.setItem('staffId', '')
      localStorage.setItem('displayName', clinicData.ownerName || '')
      localStorage.setItem('userEmail', emailLC)

      await setDoc(doc(db, 'users', uid), {
        uid, email: emailLC, role: 'owner', clinicId,
        fullName: clinicData.ownerName || '',
        clinicName: clinicData.name || ''
      }, { merge: true }).catch(() => {})

      setAuthUser({ uid, email: emailLC, role: 'owner', clinicId })
      router.replace('/clinic/' + clinicId + '/owner/dashboard')
      return
    }

    const adminResults = await getDocs(query(
      collection(db, 'admin_users'), where('userId', '==', uid)
    )).catch(e => { console.error('Admin query error:', e); return null })

    if (adminResults && !adminResults.empty) {
      const adminData = adminResults.docs[0].data()
      setAuthUser({ uid, email: emailLC, role: 'super_admin', clinicId: '' })
      localStorage.setItem('adminRole', adminData.role)
      localStorage.setItem('userRole', 'super_admin')
      localStorage.setItem('staffType', 'super_admin')
      localStorage.setItem('displayName', 'مدير النظام')
      localStorage.setItem('userEmail', emailLC)

      await setDoc(doc(db, 'users', uid), {
        uid, email: emailLC, role: 'super_admin'
      }, { merge: true }).catch(() => {})

      router.replace('/super-admin/dashboard')
      return
    }

    error.value = 'الحساب غير مسجل في النظام. تواصل مع المدير للحصول على حساب.'

  } catch (err) {
    console.error('Login error:', err)
    if (err.code === 'auth/user-not-found') {
      error.value = 'البريد الإلكتروني غير مسجل في النظام'
    } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
      error.value = 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    } else if (err.code === 'auth/too-many-requests') {
      error.value = 'تم حظر الحساب مؤقتاً بسبب محاولات كثيرة. حاول لاحقاً.'
    } else if (err.code === 'auth/network-request-failed') {
      error.value = 'خطأ في الاتصال بالإنترنت. تحقق من اتصالك.'
    } else {
      error.value = 'حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #1150c9 100%);
  position: relative;
  overflow: hidden;
}
.login-back{position:fixed;top:16px;left:16px;z-index:10;width:44px;height:44px;border-radius:12px;border:none;background:rgba(255,255,255,0.1);backdrop-filter:blur(8px);color:#fff;display:grid;place-items:center;cursor:pointer;transition:all .2s}
.login-back:active{background:rgba(255,255,255,0.2);transform:scale(0.95)}

.bg-orbs {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  will-change: transform;
}

.orb-1 {
  width: 350px;
  height: 350px;
  background: #1150c9;
  top: -10%;
  right: -8%;
  animation: orbFloat 8s ease-in-out infinite;
}

.orb-2 {
  width: 280px;
  height: 280px;
  background: #0d9488;
  bottom: -5%;
  left: -5%;
  animation: orbFloat 10s ease-in-out infinite reverse;
}

@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20px, -15px) scale(1.03); }
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: #fff;
  border-radius: 20px;
  padding: 36px 32px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
  animation: cardSlideUp 0.4s ease-out;
}

@keyframes cardSlideUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.brand-section {
  text-align: center;
  margin-bottom: 28px;
}

.logo-wrap {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  overflow: hidden;
  margin: 0 auto 14px;
  box-shadow: 0 6px 20px rgba(17, 80, 201, 0.2);
  border: 3px solid #f0f4ff;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.brand-name {
  font: 900 1.8rem/1 'Cairo', sans-serif;
  background: linear-gradient(135deg, #1150c9, #0d9488);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 4px;
}

.brand-tagline {
  font: 400 0.8rem 'Tajawal', sans-serif;
  color: #94a3b8;
  margin: 0;
}

.alert-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
  font: 500 0.8rem 'Tajawal', sans-serif;
  margin-bottom: 14px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group label {
  display: block;
  font: 600 0.78rem 'Cairo', sans-serif;
  color: #475569;
  margin-bottom: 5px;
}

.input-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-box.active {
  border-color: #1150c9;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(17, 80, 201, 0.08);
}

.input-box svg {
  flex-shrink: 0;
  color: #94a3b8;
}

.input-box.active svg {
  color: #1150c9;
}

.input-box input {
  flex: 1;
  border: none;
  outline: none;
  background: none;
  padding: 13px 0;
  font: 500 0.9rem 'Tajawal', sans-serif;
  color: #0f172a;
}

.input-box input::placeholder {
  color: #a0aec0;
}

.toggle-vis {
  display: grid;
  place-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.2s;
}

.toggle-vis:hover {
  color: #1150c9;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  font: 500 0.8rem 'Tajawal', sans-serif;
  color: #64748b;
}

.remember-cb {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.cb-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  flex-shrink: 0;
  transition: all 0.2s;
}

.remember-cb:checked + .cb-custom {
  background: #1150c9;
  border-color: #1150c9;
}

.remember-cb:checked + .cb-custom::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translateY(-1px);
}

.btn-login {
  width: 100%;
  padding: 13px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #1150c9, #0d9488);
  color: #fff;
  font: 800 1rem/1 'Cairo', sans-serif;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s;
  margin-top: 2px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(17, 80, 201, 0.35);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.copyright {
  text-align: center;
  margin-top: 20px;
  font: 400 0.68rem 'Tajawal', sans-serif;
  color: #94a3b8;
}

.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-3px); }
}

@media (max-width: 480px) {
  .login-page {
    padding: 12px;
    align-items: center;
  }
  .login-card {
    padding: 28px 20px;
    border-radius: 16px;
  }
  .logo-wrap {
    width: 56px;
    height: 56px;
    border-radius: 14px;
  }
  .brand-name {
    font-size: 1.5rem;
  }
  .brand-tagline {
    font-size: 0.75rem;
  }
  .input-box input {
    font-size: 0.85rem;
    padding: 11px 0;
  }
  .btn-login {
    padding: 12px;
    font-size: 0.95rem;
  }
  .orb-1 { width: 200px; height: 200px; }
  .orb-2 { width: 160px; height: 160px; }
}

@media (min-width: 768px) {
  .login-card {
    max-width: 400px;
    padding: 40px 36px;
  }
}
</style>
