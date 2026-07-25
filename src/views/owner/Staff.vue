<template>
  <AppLayout>
    <div class="staff-page">
      <header class="page-header">
        <div class="header-left">
          <h1 class="page-title">{{ t.staff }}</h1>
          <p class="page-subtitle">{{ t.staffDescription }}</p>
        </div>
        <router-link :to="`/clinic/${authStore.clinicId}/owner/staff/add`" class="btn-add-staff">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          إضافة طاقم
        </router-link>
      </header>

      <div class="stats-row">
        <div class="stat-card glass">
          <div class="stat-icon purple">
            <span>👥</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ totalStaff }}</span>
            <span class="stat-label">{{ t.totalStaff }}</span>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon pink">
            <span>💁</span>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ secretaryCount }}</span>
            <span class="stat-label">سكرتير</span>
          </div>
        </div>
      </div>

      <div class="filter-tabs glass">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t.loading }}</p>
      </div>

      <div v-else-if="filteredStaff.length === 0" class="empty-state glass">
        <div class="empty-icon">🏥</div>
        <h3>{{ t.noData }}</h3>
        <p>{{ t.addTeamMembers }}</p>
      </div>

      <div v-else class="staff-grid">
        <div
          v-for="member in filteredStaff"
          :key="member.id"
          class="staff-card glass"
        >
          <div class="card-header">
            <div
              class="staff-avatar"
              :style="{ background: getAvatarColor(member.fullName || member.name) }"
            >
              <img
                v-if="member.photoURL"
                :src="member.photoURL"
                :alt="member.fullName || member.name"
                class="avatar-img"
              />
              <span v-else class="avatar-initials">{{ getInitials(member.fullName || member.name) }}</span>
            </div>
            <div class="staff-status-dot" :class="{ active: member.status !== 'inactive' }"></div>
          </div>

          <div class="card-body">
            <h3 class="staff-name">{{ member.fullName || member.name }}</h3>
            <span class="staff-role">{{ getRoleLabel(member.role) }}</span>
            <div class="staff-details">
              <div class="detail-row">
                <span class="detail-icon">✉️</span>
                <span class="detail-text">{{ member.email }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-icon">📞</span>
                <span class="detail-text">{{ member.phone || '-' }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <button class="card-action edit" @click="editStaff(member)">✏️ {{ t.edit }}</button>
            <button class="card-action creds" @click="showCredentials(member)">🔑 البيانات</button>
            <button
              class="card-action toggle"
              :class="{ deactivate: member.status !== 'inactive' }"
              @click="toggleStatus(member)"
            >
              {{ member.status === 'inactive' ? '✅' : '⏸️' }}
              {{ member.status === 'inactive' ? t.activate : t.deactivate }}
            </button>
            <button class="card-action delete" @click="deleteStaff(member)">🗑️</button>
          </div>
        </div>
      </div>
      <div v-if="editingMember" class="modal-overlay" @click.self="editingMember = null">
        <div class="modal glass">
          <div class="modal-header">
            <h2>تعديل الطاقم</h2>
            <button class="modal-close" @click="editingMember = null">✕</button>
          </div>
          <form class="modal-form" @submit.prevent="saveEdit">
            <div class="form-group">
              <label>الاسم الكامل</label>
              <input v-model="editForm.fullName" type="text" required />
            </div>
            <div class="form-group">
              <label>الهاتف</label>
              <input v-model="editForm.phone" type="tel" />
            </div>
            <div class="form-group">
              <label>الدور</label>
              <select v-model="editForm.role">
                <option value="secretary">سكرتير</option>
              </select>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="editingMember = null">إلغاء</button>
              <button type="submit" class="btn-submit">حفظ</button>
            </div>
          </form>
        </div>
      </div>

      <div v-if="credsMember" class="modal-overlay" @click.self="credsMember = null">
        <div class="modal glass">
          <div class="modal-header">
            <h2>بيانات تسجيل الدخول</h2>
            <button class="modal-close" @click="credsMember = null">✕</button>
          </div>
          <div class="creds-display">
            <div class="creds-info-row">
              <span class="creds-label">الاسم</span>
              <span class="creds-value">{{ credsMember.fullName || credsMember.name }}</span>
            </div>
            <div class="creds-info-row">
              <span class="creds-label">البريد الإلكتروني</span>
              <span class="creds-value creds-email">{{ credsMember.email }}</span>
              <button class="copy-btn" @click="copyText(credsMember.email)">
                {{ copyMsg === 'email' ? '✓' : '📋' }}
              </button>
            </div>
            <div class="creds-info-row">
              <span class="creds-label">الدور</span>
              <span class="creds-value">{{ getRoleLabel(credsMember.role) }}</span>
            </div>
            <div class="creds-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>كلمة المرور لا يتم حفظها. يمكنك إعادة تعيينها من خلال Firebase.</span>
            </div>
            <div class="creds-actions">
              <button class="btn-reset-pass" @click="resetPassword(credsMember.email)">
                🔄 إعادة تعيين كلمة المرور
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useI18n } from '@/composables/useI18n'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase/config'

const { t } = useI18n()
const authStore = useAuthStore()

const staff = ref([])
const loading = ref(true)
const activeTab = ref('all')
const credsMember = ref(null)
const copyMsg = ref('')

const tabs = computed(() => [
  { key: 'all', label: t.value.all },
  { key: 'secretary', label: 'سكرتير' }
])

const totalStaff = computed(() => staff.value.length)
const secretaryCount = computed(() => staff.value.filter(s => s.role === 'secretary').length)

const filteredStaff = computed(() => {
  if (activeTab.value === 'all') return staff.value
  return staff.value.filter(s => s.role === activeTab.value)
})

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function getAvatarColor(name) {
  const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#f97316', '#e11d48']
  if (!name) return colors[0]
  return colors[name.charCodeAt(0) % colors.length]
}

function getRoleLabel(role) {
  const map = { owner: 'الطبيب', secretary: 'سكرتير' }
  return map[role] || role
}

const editingMember = ref(null)
const editForm = ref({ fullName: '', phone: '', role: 'secretary', specialization: '' })

function editStaff(member) {
  editingMember.value = member
  editForm.value = {
    fullName: member.fullName || member.name || '',
    phone: member.phone || '',
    role: member.role || 'assistant',
    specialization: member.specialization || ''
  }
}

async function saveEdit() {
  if (!editingMember.value) return
  try {
    await updateDoc(doc(db, 'users', editingMember.value.id), {
      fullName: editForm.value.fullName,
      phone: editForm.value.phone,
      role: editForm.value.role,
      specialization: editForm.value.role === 'doctor' ? editForm.value.specialization : ''
    })
    const idx = staff.value.findIndex(s => s.id === editingMember.value.id)
    if (idx !== -1) {
      staff.value[idx] = {
        ...staff.value[idx],
        fullName: editForm.value.fullName,
        phone: editForm.value.phone,
        role: editForm.value.role,
        specialization: editForm.value.role === 'doctor' ? editForm.value.specialization : ''
      }
    }
    editingMember.value = null
  } catch (error) {
  }
}

function showCredentials(member) {
  credsMember.value = member
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    copyMsg.value = 'email'
    setTimeout(() => { copyMsg.value = '' }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copyMsg.value = 'email'
    setTimeout(() => { copyMsg.value = '' }, 2000)
  }
}

async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email)
    alert('تم إرسال رابط إعادة تعيين كلمة المرور على البريد الإلكتروني')
  } catch {
    alert('فشل إرسال الرابط')
  }
}

async function toggleStatus(member) {
  const newStatus = member.status === 'inactive' ? 'active' : 'inactive'
  try {
    await updateDoc(doc(db, 'users', member.id), { status: newStatus })
    member.status = newStatus
  } catch (error) {
  }
}

async function deleteStaff(member) {
  if (!confirm(`${t.value.confirmDelete} ${member.fullName || member.name}?`)) return
  try {
    await updateDoc(doc(db, 'users', member.id), { status: 'deleted' })
    staff.value = staff.value.filter(s => s.id !== member.id)
  } catch (error) {
  }
}

async function fetchStaff() {
  loading.value = true
  try {
    const q = query(
      collection(db, 'users'),
      where('clinicId', '==', authStore.clinicId)
    )
    const snapshot = await getDocs(q)
    staff.value = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(s => s.status !== 'deleted')
  } catch (error) {
  } finally {
    loading.value = false
  }
}

onMounted(fetchStaff)
</script>

<style scoped>
.staff-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-add-staff {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-add-staff:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0.25rem 0 0;
}

.glass {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.stat-icon.purple { background: linear-gradient(135deg, #7c3aed, #a78bfa); }
.stat-icon.blue { background: linear-gradient(135deg, #2563eb, #60a5fa); }
.stat-icon.teal { background: linear-gradient(135deg, #0d9488, #2dd4bf); }
.stat-icon.pink { background: linear-gradient(135deg, #db2777, #f472b6); }

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.82rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.filter-tabs {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.35rem;
  margin-bottom: 2rem;
}

.tab-btn {
  padding: 0.6rem 1.25rem;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.tab-btn:not(.active):hover {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 4rem;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.empty-state h3 { color: #1e293b; margin: 0 0 0.5rem; }
.empty-state p { color: #64748b; margin: 0; }

.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.staff-card {
  padding: 1.5rem;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.staff-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.staff-avatar {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
}

.staff-status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ef4444;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}

.staff-status-dot.active {
  background: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.card-body {
  flex: 1;
  margin-bottom: 1rem;
}

.staff-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem;
}

.staff-role {
  font-size: 0.82rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.staff-details {
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-icon {
  font-size: 0.85rem;
  width: 20px;
  text-align: center;
}

.detail-text {
  font-size: 0.85rem;
  color: #64748b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 1rem;
}

.card-action {
  flex: 1;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.card-action.edit {
  background: rgba(99, 102, 241, 0.08);
  color: #4f46e5;
}

.card-action.edit:hover {
  background: rgba(99, 102, 241, 0.15);
}

.card-action.toggle {
  background: rgba(16, 185, 129, 0.08);
  color: #059669;
}

.card-action.toggle.deactivate {
  background: rgba(249, 115, 22, 0.08);
  color: #ea580c;
}

.card-action.toggle:hover {
  opacity: 0.8;
}

.card-action.delete {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  flex: 0;
  padding: 0.5rem 0.75rem;
}

.card-action.delete:hover {
  background: rgba(239, 68, 68, 0.15);
}

.modal {
  width: 90%;
  max-width: 480px;
  padding: 2rem;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #1e293b;
}

.modal-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  font-size: 1rem;
  color: #64748b;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.form-group input,
.form-group select {
  padding: 0.7rem 0.9rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 0.9rem;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.8);
  transition: border-color 0.2s ease;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  padding: 0.7rem 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(0, 0, 0, 0.04);
}

.btn-submit {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

.card-action.creds {
  background: rgba(245, 158, 11, 0.08);
  color: #d97706;
}

.card-action.creds:hover {
  background: rgba(245, 158, 11, 0.15);
}

.creds-display {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.creds-info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.creds-info-row:last-of-type {
  border-bottom: none;
}

.creds-info-row .creds-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #64748b;
  min-width: 100px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.creds-info-row .creds-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  flex: 1;
  word-break: break-all;
}

.creds-email {
  color: #0A5E52;
}

.copy-btn {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  flex-shrink: 0;
  font-size: 1rem;
}

.copy-btn:hover {
  background: #f1f5f9;
  border-color: #0A5E52;
  color: #0A5E52;
}

.creds-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  border-radius: 10px;
  margin-top: 12px;
  font-size: 0.8rem;
  color: #92400E;
}

.creds-actions {
  margin-top: 12px;
}

.btn-reset-pass {
  width: 100%;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset-pass:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

@media (max-width: 768px) {
  .staff-page { padding: 1rem; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .staff-grid { grid-template-columns: 1fr; }
}
</style>
