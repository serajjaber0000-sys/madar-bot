import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value?.uid)
  const role = computed(() => user.value?.role || '')
  const clinicId = computed(() => user.value?.clinicId || '')
  const uid = computed(() => user.value?.uid || '')
  const fullName = computed(() => userProfile.value?.fullName || user.value?.fullName || '')
  const email = computed(() => user.value?.email || '')
  const photoUrl = computed(() => userProfile.value?.photoUrl || '')

  const isSuperAdmin = computed(() => role.value === 'super_admin')
  const isOwner = computed(() => role.value === 'owner')
  const isSecretary = computed(() => role.value === 'secretary')
  const clinicName = computed(() => userProfile.value?.clinicName || '')

  function setUser(userData) {
    user.value = userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  async function fetchUserProfile() {
    if (!user.value?.uid) return
    try {
      const snap = await getDoc(doc(db, 'users', user.value.uid))
      if (snap.exists()) {
        const data = snap.data()
        userProfile.value = { id: snap.id, ...data }
        if (data.role || data.clinicId || data.fullName) {
          user.value = {
            ...user.value,
            role: data.role || user.value.role,
            clinicId: data.clinicId || user.value.clinicId,
            fullName: data.fullName || user.value.fullName,
            email: data.email || user.value.email
          }
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } else {
        const lsRole = localStorage.getItem('userRole')
        const lsClinic = localStorage.getItem('clinicId')
        const lsName = localStorage.getItem('displayName')
        if (lsRole) {
          user.value = {
            ...user.value,
            role: lsRole,
            clinicId: lsClinic || '',
            fullName: lsName || ''
          }
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      }
    } catch (e) {
      const lsRole = localStorage.getItem('userRole')
      const lsClinic = localStorage.getItem('clinicId')
      const lsName = localStorage.getItem('displayName')
      if (lsRole) {
        user.value = {
          ...user.value,
          role: lsRole,
          clinicId: lsClinic || '',
          fullName: lsName || ''
        }
        localStorage.setItem('user', JSON.stringify(user.value))
      }
    }
  }

  async function logout() {
    try {
      await signOut(auth)
    } catch (e) {
    }
    user.value = null
    userProfile.value = null
    localStorage.removeItem('user')
    router.push('/login')
  }

  function getDashboardPath() {
    if (isSuperAdmin.value) return '/super-admin/dashboard'
    if (isOwner.value && clinicId.value) return `/clinic/${clinicId.value}/owner/dashboard`
    if (isSecretary.value && clinicId.value) return `/clinic/${clinicId.value}/secretary/dashboard`
    return '/login'
  }

  function init() {
    return new Promise((resolve) => {
      let resolved = false

      const safeResolve = () => {
        if (resolved) return
        resolved = true
        loading.value = false
        initialized.value = true
        resolve()
      }

      try {
        const stored = localStorage.getItem('user')
        let storedUser = null
        if (stored) {
          try {
            storedUser = JSON.parse(stored)
            user.value = storedUser
          } catch (e) {
            storedUser = null
            user.value = null
          }
        }

        const doResolve = async () => {
          if (resolved) return
          await fetchUserProfile()
          safeResolve()
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          try {
            if (firebaseUser) {
              if (!user.value) {
                user.value = { uid: firebaseUser.uid, email: firebaseUser.email }
              } else {
                user.value = { ...user.value, uid: firebaseUser.uid, email: firebaseUser.email }
              }
              localStorage.setItem('user', JSON.stringify(user.value))
              await doResolve()
            } else {
              user.value = null
              userProfile.value = null
              localStorage.removeItem('user')
              await doResolve()
            }
          } catch (e) {
            console.error('Auth state error:', e)
            safeResolve()
          }
          if (unsubscribe) unsubscribe()
        })
      } catch (e) {
        console.error('Auth init error:', e)
        safeResolve()
      }
    })
  }

  async function updateClinicName(newName) {
    if (!user.value?.uid) return
    try {
      await updateDoc(doc(db, 'users', user.value.uid), { clinicName: newName })
      if (userProfile.value) userProfile.value.clinicName = newName
    } catch (e) {
      console.error('Failed to update clinic name:', e)
    }
  }

  return {
    user, userProfile, loading, initialized,
    isLoggedIn, role, clinicId, uid, fullName, email, photoUrl,
    isSuperAdmin, isOwner, isSecretary, clinicName,
    setUser, fetchUserProfile, logout, getDashboardPath, updateClinicName, init
  }
})
