const SITE_TITLE = 'مدار — دليل الأطباء والعيادات الطبية في العراق'
const routes = [
  { path: '/', component: () => import('../views/public/DoctorsDirectory.vue'), meta: { public: true, title: 'دليل الأطباء — مدار' } },
  { path: '/directory', redirect: '/' },
  { path: '/doctor/:clinicId', component: () => import('../views/public/DoctorProfile.vue'), meta: { public: true, title: SITE_TITLE } },
  { path: '/listing/:listingId', component: () => import('../views/public/ListingProfile.vue'), meta: { public: true, title: SITE_TITLE } },
  { path: '/about', component: () => import('../views/public/AboutUs.vue'), meta: { public: true, title: 'من نحن — مدار' } },
  { path: '/contact', component: () => import('../views/public/ContactUs.vue'), meta: { public: true, title: 'تواصل معنا — مدار' } },
  { path: '/bmi', component: () => import('../views/public/BmiCalculator.vue'), meta: { public: true, title: 'حاسبة الوزن المثالي — مدار' } },
  { path: '/favorites', component: () => import('../views/public/FavoritesBookings.vue'), meta: { public: true, title: 'المفضلة — مدار' } },
  { path: '/bookings', component: () => import('../views/public/Bookings.vue'), meta: { public: true, title: 'حجوزاتي — مدار' } },
  { path: '/chat', component: () => import('../views/public/PatientChat.vue'), meta: { public: true, title: 'محادثة مع العيادة — مدار' } },
  { path: '/login', component: () => import('../views/auth/Login.vue'), meta: { guest: true, title: 'دخول النظام — مدار' } },
  { path: '/onboarding', component: () => import('../views/auth/Onboarding.vue'), meta: { guest: true, title: 'مرحباً بك — مدار' } },
  { path: '/maintenance', component: () => import('../views/MaintenancePage.vue'), meta: { public: true, title: 'صيانة — مدار' } },
  { path: '/patient/:clinicId/:patientId', component: () => import('../views/shared/PatientPublic.vue'), meta: { public: true, title: SITE_TITLE } },
  { path: '/promoter', component: () => import('../views/public/PromoterPage.vue'), meta: { public: true, title: 'شرح النظام للمروجين — مدار' } },

  // Super Admin
  { path: '/super-admin', redirect: '/super-admin/dashboard', meta: { requiresAuth: true, role: 'super_admin' } },
  { path: '/super-admin/dashboard', component: () => import('../views/super-admin/Dashboard.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'لوحة التحكم — مدار' } },
  { path: '/super-admin/clinics', component: () => import('../views/super-admin/Clinics.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'العيادات — مدار' } },
  { path: '/super-admin/clinics/add', component: () => import('../views/super-admin/AddClinic.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'إضافة عيادة — مدار' } },
  { path: '/super-admin/clinics/:id', component: () => import('../views/super-admin/ClinicDetails.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'تفاصيل العيادة — مدار' } },
  { path: '/super-admin/subscriptions', component: () => import('../views/super-admin/Subscriptions.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'الاشتراكات — مدار' } },
  { path: '/super-admin/maintenance', component: () => import('../views/super-admin/Maintenance.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'الصيانة — مدار' } },
  { path: '/super-admin/directory-settings', component: () => import('../views/super-admin/DirectorySettings.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'إعدادات الدليل — مدار' } },
  { path: '/super-admin/slider', component: () => import('../views/super-admin/SliderManager.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'إدارة السلايدر — مدار' } },
  { path: '/super-admin/directory-listings', component: () => import('../views/super-admin/DirectoryListings.vue'), meta: { requiresAuth: true, role: 'super_admin', title: 'دليل الأطباء — مدار' } },

  // Owner (Main Doctor) — all clinical features live here
  { path: '/clinic/:clinicId/owner/dashboard', component: () => import('../views/owner/Dashboard.vue'), meta: { requiresAuth: true, role: 'owner', title: 'لوحة التحكم — مدار' } },
  { path: '/clinic/:clinicId/owner/patients', component: () => import('../views/owner/Patients.vue'), meta: { requiresAuth: true, role: 'owner', title: 'المرضى — مدار' } },
  { path: '/clinic/:clinicId/owner/patients/:patientId', component: () => import('../views/owner/PatientProfile.vue'), meta: { requiresAuth: true, role: 'owner', title: 'ملف المريض — مدار' } },
  { path: '/clinic/:clinicId/owner/appointments', component: () => import('../views/owner/Appointments.vue'), meta: { requiresAuth: true, role: 'owner', title: 'المواعيد — مدار' } },
  { path: '/clinic/:clinicId/owner/medical-record', component: () => import('../views/owner/MedicalRecord.vue'), meta: { requiresAuth: true, role: 'owner', title: 'السجل الطبي — مدار' } },
  { path: '/clinic/:clinicId/owner/billing', component: () => import('../views/owner/Billing.vue'), meta: { requiresAuth: true, role: 'owner', title: 'الفواتير — مدار' } },
  { path: '/clinic/:clinicId/owner/staff', component: () => import('../views/owner/Staff.vue'), meta: { requiresAuth: true, role: 'owner', title: 'الطاقم — مدار' } },
  { path: '/clinic/:clinicId/owner/staff/add', component: () => import('../views/owner/AddStaff.vue'), meta: { requiresAuth: true, role: 'owner', title: 'إضافة موظف — مدار' } },

  { path: '/clinic/:clinicId/owner/settings', component: () => import('../views/owner/Settings.vue'), meta: { requiresAuth: true, role: 'owner', title: 'الإعدادات — مدار' } },
  { path: '/clinic/:clinicId/owner/reports', component: () => import('../views/owner/Reports.vue'), meta: { requiresAuth: true, role: 'owner', title: 'التقارير — مدار' } },

  // Secretary
  { path: '/clinic/:clinicId/secretary/dashboard', component: () => import('../views/secretary/Dashboard.vue'), meta: { requiresAuth: true, role: 'secretary', title: 'لوحة التحكم — مدار' } },
  { path: '/clinic/:clinicId/secretary/patients', component: () => import('../views/secretary/Patients.vue'), meta: { requiresAuth: true, role: 'secretary', title: 'المرضى — مدار' } },
  { path: '/clinic/:clinicId/secretary/appointments', component: () => import('../views/secretary/Appointments.vue'), meta: { requiresAuth: true, role: 'secretary', title: 'المواعيد — مدار' } },
  { path: '/clinic/:clinicId/secretary/chats', component: () => import('../views/secretary/SecretaryChats.vue'), meta: { requiresAuth: true, role: 'secretary', title: 'محادثات المرضى — مدار' } },

  // Shared (Owner + Secretary)
  { path: '/clinic/:clinicId/notifications', component: () => import('../views/shared/Notifications.vue'), meta: { requiresAuth: true, role: 'owner,secretary', title: 'الإشعارات — مدار' } },
  { path: '/clinic/:clinicId/chat', component: () => import('../views/shared/Chat.vue'), meta: { requiresAuth: true, role: 'owner,secretary', title: 'المحادثة — مدار' } },

  // 404
  { path: '/:pathMatch(.*)*', component: () => import('../views/NotFound.vue'), meta: { title: 'صفحة غير موجودة — مدار' } }
]
export default routes
