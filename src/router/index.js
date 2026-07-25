import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import { auth, db } from '@/firebase/config'
import { doc, getDoc } from 'firebase/firestore'

let cachedUser = null
let maintenanceCache = null
let maintenanceCacheTime = 0
const MAINTENANCE_CACHE_TTL = 30000

const maintenanceRoutes = ['/login', '/maintenance']
const maintenanceRoutePrefixes = ['/super-admin/']

async function isMaintenanceActive() {
  const now = Date.now()
  if (maintenanceCache !== null && now - maintenanceCacheTime < MAINTENANCE_CACHE_TTL) {
    return maintenanceCache
  }
  try {
    const snap = await getDoc(doc(db, 'platform_settings', 'maintenance'))
    if (snap.exists()) {
      maintenanceCache = !!snap.data().enabled
    } else {
      maintenanceCache = false
    }
  } catch {
    maintenanceCache = false
  }
  maintenanceCacheTime = now
  return maintenanceCache
}

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    if (stored) cachedUser = JSON.parse(stored)
    else cachedUser = null
  } catch {
    cachedUser = null
    localStorage.removeItem('user')
  }
  return cachedUser
}

function waitForAuth() {
  return new Promise(resolve => {
    const unsub = auth.onAuthStateChanged(user => {
      unsub()
      resolve(user)
    })
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes
})

let authChecked = false

router.beforeEach(async (to, from, next) => {
  if (!authChecked) {
    const fbUser = await waitForAuth()
    authChecked = true

    if (!fbUser) {
      localStorage.removeItem('user')
      cachedUser = null
    }
  }

  const user = getStoredUser()
  const isLoggedIn = !!user?.uid
  const cid = user?.clinicId || ''

  if (to.path === '/maintenance' || to.meta.public) {
    next()
    return
  }

  if (isLoggedIn && user.role === 'super_admin') {
    if (!to.meta.public) {
      const isSuperAdminRoute = maintenanceRoutePrefixes.some(p => to.path.startsWith(p))
      if (!isSuperAdminRoute) {
        const maintenanceOn = await isMaintenanceActive()
        if (maintenanceOn) {
          next('/maintenance')
          return
        }
      }
    }
    next()
    return
  }

  const isSuperAdminRoute = maintenanceRoutePrefixes.some(p => to.path.startsWith(p))
  if (!isSuperAdminRoute && !to.meta.public) {
    const maintenanceOn = await isMaintenanceActive()
    if (maintenanceOn) {
      next('/maintenance')
      return
    }
  }

  if (to.path === '/login' && !isLoggedIn) {
    const seen = localStorage.getItem('madar_onboarding_seen')
    if (!seen) { next('/onboarding'); return }
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
    return
  }

  if (to.meta.guest && isLoggedIn) {
    const r = user.role
    if (r === 'super_admin') next('/super-admin/dashboard')
    else if (r === 'owner' && cid) next(`/clinic/${cid}/owner/dashboard`)
    else if (r === 'secretary' && cid) next(`/clinic/${cid}/secretary/dashboard`)
    else next('/login')
    return
  }

  if (to.meta.role && isLoggedIn) {
    const allowedRoles = to.meta.role.split(',')
    if (!allowedRoles.includes(user.role)) {
      const r = user.role
      if (r === 'super_admin') next('/super-admin/dashboard')
      else if (r === 'owner' && cid) next(`/clinic/${cid}/owner/dashboard`)
      else if (r === 'secretary' && cid) next(`/clinic/${cid}/secretary/dashboard`)
      else next('/login')
      return
    }
  }

  if (to.meta.public) {
    next()
    return
  }

  if (to.params.clinicId && isLoggedIn && user.role !== 'super_admin') {
    if (to.params.clinicId !== cid) {
      if (cid) next(`/clinic/${cid}/${user.role}/dashboard`)
      else next('/login')
      return
    }
  }

  next()
})

router.afterEach((to) => {
  const title = to.meta.title || 'مدار'
  document.title = title
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) ogTitle.setAttribute('content', title)
})

export default router
