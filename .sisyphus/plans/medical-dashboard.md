# مدار — General Medical Clinic Management Platform

## Project Overview
A complete, production-ready **general medical clinic management platform** (Vue 3 + Firebase) — Arabic-only, mobile-first design system with sidebar navigation.

**Important**: This project has a dual purpose:
1. **Public Website**: Patients browse doctors, view ratings/reviews, book appointments, search by name/specialty/area
2. **Clinic Management**: Full patient file management, appointments, medical records, billing, staff management

### System Roles (Updated)
- **Super Admin**: System-wide management
- **Owner (المالك)**: Main doctor / clinic owner — manages all clinic operations
- **Secretary (السكرتير)**: Assists with patients, appointments, notifications
- **Note**: Doctor and Assistant roles have been **removed** from the system

### Key Rule: Each Clinic is Fully Isolated
Each clinic is a separate entity with its own:
- Patients, appointments, diagnoses, prescriptions, medical records
- Staff (secretaries), billing, settings, income/expenses
- Clinic name, owner info, subscription plan
- All data is scoped by `clinicId`
- Clinic staff authenticate via Firebase Auth (`users` collection), then queried from `staff` or `clinics` collections

### Public Website Features
- **Public Doctor Directory** (`/`): Search doctors by name, specialty, area/region
- **Specialty Chips**: Quick-filter by top specialties (cardiology, dentistry, etc.)
- **Doctor Profile Pages** (`/doctor/:clinicId`): Full details, reviews, ratings, contact
- **Patient File Lookup** (`/patient/:clinicId/:patientId`): Public view of patient medical data with PDF/PNG download
- **QR Codes**: Generated for each patient for easy lookup
- **SEO**: Proper meta tags, Open Graph, semantic HTML for all public pages
- **Search**: Real-time search with debounce across doctor names, specialties, and clinic addresses
- **Filtering**: Filter doctors by area/region, specialty, and type (doctors, labs, hospitals, offers)

### UI Design System
- Primary: `#1150c9` (medical blue)
- Accent/Teal: `#0d9488`
- Gold: `#d69e1f` (accent)
- Success: `#10b981`
- Background: `#f8f9fc`
- Card: `#ffffff`
- All currency in Iraqi Dinar (IQD/د.ع)
- Arabic-only, RTL layout throughout

## What Was Done So Far

### Phase 1: Arabic Conversion & Design System (Complete)
- Full Arabic-only conversion
- Design system colors applied to all pages
- Sidebar navigation with collapsible desktop + slide-out mobile
- Custom reusable CSS components

### Phase 2: Firebase Service Layer (Complete)
- All services use `clinicId` from auth store for data scoping
- Repository pattern in `src/services/clinic.js`
- Public-facing functions with `listPublic()` for unauthenticated queries

### Phase 3: Firebase Rules & Firestore Security (Complete)
- All collections protected with proper auth rules
- Patient files: `patientId` doc for metadata, `patientId/files` subcollection for files
- Admin collections: `admin_users`, `audit_logs`, `review_comments`, `site_sliders`, `directory_settings`, `site_sliders_settings`
- **Note**: `site_sliders` and `site_sliders_settings` rules were missing (caused silent slider failures) — added `allow get/list: if true` for both

### Phase 4: Critical Bug Fixes (Complete)
- **Login Bug Fixed**: Login.vue now calls `setAuthUser()` (which updates both Pinia auth store AND localStorage) before every `router.replace()`. The router guard reads `localStorage.getItem('user')` for `{ uid, role, clinicId }` — previously this was never set during login.
- **Auth Store `fetchUserProfile`**: Now falls back to localStorage when Firestore read fails
- **App.vue Boot Screen Removed**: App mounts immediately in `main.js` without waiting for auth init
- **Splash Screen**: Shows once per session (sessionStorage), with animated progress bar and glowing logo
- **Forgot Password Removed**: Link, route, and file all deleted
- **Slider CSS Bug Fixed**: `.dd-fade-slide.active` now has `position: relative` so container has height
- **Firebase Hosting Quota**: Deleted 58 old versions via REST API to free space
- **Sidebar Menu Issue**: Fixed by adding `useAuthStore` import to Login.vue and calling `authStore.setUser()` so AppLayout can read `authStore.role` to build sidebar menu items

### Phase 5: DoctorsDirectory Redesign (Complete)
- **Mobile Hamburger Menu**: Shows on mobile/tablet with links: directory, about us, contact us, BMI calculator, divider, login
- **Intro Section**: 4 feature cards explaining what مدار is: "دليل شامل", "تقييمات حقيقية", "حجز سهل", "بحث بالمنطقة"
- **Top 10 Rated Doctors**: Changed from top 3 to top 10, shown in 2-column grid
- **2-Column Doctor Grid**: Always shows 2 columns on desktop/laptop
- **Area Filter**: Prominent area/province dropdown filter
- **Modern Footer**: Dark background (#0f172a), 3-column layout with brand, quick links, contact links

## Login Flow (Current Implementation)
1. User enters email/password on Login.vue
2. Firebase Auth `signInWithEmailAndPassword` called
3. On success, queries Firestore collections in this order (fast path → fallback):
   a. `users/{uid}` — checks `role` + `clinicId` (fast path)
   b. If not found, queries `staff` collection by `userId` → finds `role` + `clinicId`
   c. If not found, queries `clinics` by `ownerUserId` → finds `role: 'owner'` + `clinicId`
   d. If not found, queries `admin_users` by `userId` → finds `role: 'super_admin'`
   e. If none match: shows error
4. On match: saves to localStorage, updates Pinia auth store via `authStore.setUser()`, navigates to dashboard
5. If user already has a `users/{uid}` doc with `role` + `clinicId`, skips steps b-d entirely (fast path)

## Important Files

### Configuration & Entry
- `.env`: Firebase + imgbb config
- `index.html`: SEO meta tags, splash screen (sessionStorage-based, progress bar, glowing logo)
- `src/main.js`: App mounts immediately, auth init runs async (no blocking)
- `src/App.vue`: Simplified — no boot screen, just router-view with page transitions

### Auth & Navigation
- `src/stores/auth.js`: Pinia auth store — user, userProfile, login/logout, `fetchUserProfile` with localStorage fallback, `init()` async
- `src/router/routes.js`: All routes (35 total) — forgot-password route removed
- `src/router/index.js`: Navigation guard — `authChecked` flag, reads `localStorage.getItem('user')` for role-based routing, maintenance check

### Core Services
- `src/firebase/config.js`: Firebase config exports
- `src/services/clinic.js`: All repos — patientsRepo, appointmentsRepo, diagnosesRepo, prescriptionsRepo, auditLogsRepo, patientDocsRepo, backupRepo, incomeRepo, expensesRepo, reviewsRepo

### UI Components
- `src/components/AppLayout.vue`: Sidebar nav (role-based menu items from `authStore.role`), notification bell, `showEditClinicName`
- `src/components/AppSidebar.vue`: Standalone sidebar component

### Public Pages
- `src/views/public/DoctorsDirectory.vue`: Main directory page — slider, search, filters, doctor cards
- `src/views/public/DoctorProfile.vue`: Individual doctor profile with reviews, ratings, contact
- `src/views/public/PatientPublic.vue`: Patient file lookup page
- `src/views/public/AboutUs.vue`: About us page
- `src/views/public/ContactUs.vue`: Contact us page
- `src/views/public/BmiCalculator.vue`: BMI calculator page

### Auth Pages
- `src/views/auth/Login.vue`: Login with fast-path user lookup, localStorage fallback, Pinia auth store sync
- `src/views/auth/Onboarding.vue`: Onboarding wizard

### Super Admin Pages
- `src/views/super-admin/Dashboard.vue`: Admin dashboard with stat cards and charts
- `src/views/super-admin/Clinics.vue`: Clinic management
- `src/views/super-admin/AddClinic.vue`: Add new clinic form
- `src/views/super-admin/ClinicDetails.vue`: Clinic detail/edit view
- `src/views/super-admin/Subscriptions.vue`: Subscription plans management
- `src/views/super-admin/Maintenance.vue`: Maintenance mode control
- `src/views/super-admin/DirectorySettings.vue`: Directory settings (enable/disable sections, specialties, areas)
- `src/views/super-admin/SliderManager.vue`: Slider management (settings card, image preview, card grid, modal)

### Owner Pages
- `src/views/owner/Dashboard.vue`: Dashboard with stat cards, income/expenses, appointments, recent patients
- `src/views/owner/Patients.vue`: Patient management with search, filters, add/edit patient
- `src/views/owner/PatientProfile.vue`: Patient file view with medical records, diagnoses, prescriptions
- `src/views/owner/Appointments.vue`: Appointments calendar + list view
- `src/views/owner/MedicalRecord.vue`: Medical records management
- `src/views/owner/Billing.vue`: Billing & financial management
- `src/views/owner/Staff.vue`: Staff list management
- `src/views/owner/AddStaff.vue`: Add staff form
- `src/views/owner/Settings.vue`: Clinic settings
- `src/views/owner/Reports.vue`: Reports & analytics

### Secretary Pages
- `src/views/secretary/Dashboard.vue`: Secretary dashboard
- `src/views/secretary/Patients.vue`: Patient management (limited permissions)
- `src/views/secretary/Appointments.vue`: Appointment management (limited permissions)

### Shared Pages
- `src/views/shared/Notifications.vue`: Notifications (owner + secretary)
- `src/views/shared/Chat.vue`: Chat/messaging (owner + secretary)
- `src/views/shared/PatientPublic.vue`: Public patient file view

### Global Styles
- `src/styles/eyiadati.css`: Base global styles
- `src/styles/seraj.css`: Shared reusable CSS components (cards, buttons, forms, tables, modals, badges, alerts)

## Available Agent Capabilities
- **explore**: Fast codebase search (files by pattern, code by keyword, answer codebase questions)
- **general**: Full read/write/execute agent for complex tasks (file edits, shell commands, multi-step operations)
