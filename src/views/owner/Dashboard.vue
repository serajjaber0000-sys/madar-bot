<template>
  <AppLayout>
    <div class="dash">

      <!-- HEADER -->
      <header class="dash-header">
        <div class="dh-actions">
          <router-link :to="'/clinic/' + clinicId + '/chat'" class="dh-circle-btn" title="المحادثة">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </router-link>
          <div class="dh-circle-btn" ref="bellBtnRef" :class="{ active: showNotifPanel, 'has-notifs': unreadNotifCount > 0 }" @click.stop="toggleNotifPanel" title="الإشعارات">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span v-if="unreadNotifCount > 0" class="notif-badge">{{ unreadNotifCount > 99 ? '+99' : unreadNotifCount }}</span>
          </div>

          <!-- Audit Log Feed -->
          <div class="audit-card">
            <h3>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              سجل العمليات
            </h3>
            <div v-if="auditLogs.length === 0" class="rc-empty">
              <p>لا توجد عمليات مسجلة</p>
            </div>
            <div v-else class="audit-list">
              <div v-for="log in auditLogs.slice(0, 8)" :key="log.id" class="audit-item">
                <div class="audit-dot" :class="'audit-' + (log.action || 'info')"></div>
                <div class="audit-info">
                  <span class="audit-action">{{ log.details || log.action }}</span>
                  <span class="audit-meta">{{ log.user_name }} · {{ timeAgo(log.timestamp) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Backup Button -->
          <button class="sp-btn sp-gold" @click="showBackupModal = true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            نسخ احتياطي
          </button>
        </div>

        <div class="dh-search">
          <svg class="dh-search-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
          <input v-model="searchQuery" type="text" placeholder="البحث عن مريض، رقم هاتف، أو ملف طبي..." @input="onSearch" />
          <button v-if="searchQuery" class="dh-search-clear" @click="clearSearch">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
          </button>
        </div>

        <div class="dh-profile">
          <div class="dh-dots">
            <span class="dot dot-pink"></span>
            <span class="dot dot-yellow"></span>
          </div>
          <div class="dh-info">
            <h1>{{ doctorDisplayName }}</h1>
            <span class="dh-title">طبيب عام</span>
          </div>
          <div class="dh-avatar">
            <img v-if="doctorPhoto" :src="doctorPhoto" alt="" />
            <span v-else>{{ doctorInitials }}</span>
          </div>
        </div>
      </header>

      <!-- TELEPORTED NOTIFICATION PANEL -->
      <Teleport to="body">
        <div v-if="showNotifPanel" class="nd-overlay" @click="showNotifPanel = false"></div>
        <transition name="dropdown">
          <div v-if="showNotifPanel" class="notif-dropdown" @click.stop :style="notifDropdownStyle">
            <div class="nd-header">
              <h3>الإشعارات</h3>
              <button v-if="unreadNotifCount > 0" class="nd-mark-all" @click="markAllNotifsRead">تحديد الكل كمقروء</button>
            </div>
            <div class="nd-list" v-if="notifications.length > 0">
              <div v-for="n in notifications.slice(0, 8)" :key="n.id" class="nd-item" :class="{ unread: !n.read }" @click="openNotif(n)">
                <div class="nd-icon" :class="n.type || 'info'">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div class="nd-content">
                  <span class="nd-title">{{ n.title }}</span>
                  <span class="nd-source" v-if="n.from === 'super_admin'">خدمة العملاء</span>
                  <span class="nd-source sec" v-else-if="n.from === 'secretary'">السكرتير</span>
                  <span class="nd-msg">{{ n.message }}</span>
                  <span class="nd-time">{{ timeAgo(n.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="nd-empty">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
              <p>لا توجد إشعارات</p>
            </div>
            <div class="nd-footer" v-if="notifications.length > 0">
              <button @click="$router.push('/clinic/' + clinicId + '/notifications'); showNotifPanel = false">عرض الكل</button>
            </div>
          </div>
        </transition>
      </Teleport>

      <!-- STATS -->
      <div class="dash-stats">
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ todayRevenue.toLocaleString() }} <small>د.ع</small></span>
            <span class="stat-label">إيرادات اليوم</span>
          </div>
          <div class="stat-icon si-purple">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ completedToday }}</span>
            <span class="stat-label">المرضى المكتملون اليوم</span>
          </div>
          <div class="stat-icon si-yellow">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ underConsultation }}</span>
            <span class="stat-label">المرضى تحت الاستشارة</span>
          </div>
          <div class="stat-icon si-pink">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-body">
            <span class="stat-val">{{ waitingCount }}</span>
            <span class="stat-label">عدد المرضى في الانتظار</span>
          </div>
          <div class="stat-icon si-blue">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
      </div>

      <!-- DEFAULT VIEW: Queue + Side Panel -->
      <div v-if="!selectedPatient && !searchQuery && !fullFileMode" class="dash-body">
        <!-- Queue / Archive Tabs -->
        <div class="doc-tab-bar">
          <button class="doc-tab" :class="{ active: docTab === 'queue' }" @click="docTab = 'queue'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            طابور اليوم
          </button>
          <button class="doc-tab" :class="{ active: docTab === 'archive' }" @click="docTab = 'archive'; loadDocArchive()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
            أرشيف الحجوزات
          </button>
        </div>

        <!-- Queue Table -->
        <div v-if="docTab === 'queue'" class="queue-panel">
          <div class="qp-header">
            <h2>قائمة انتظار المرضى <span class="qp-live">(مباشر)</span></h2>
          </div>
          <div class="qp-content">
            <div v-if="todayQueue.length === 0" class="qp-empty">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#cbd5e1" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>
              <p>لا يوجد مرضى في الانتظار اليوم</p>
            </div>
            <div v-else>
              <div class="qp-table-header">
                <span class="qp-col qp-col-patient">اسم المريض</span>
                <span class="qp-col qp-col-turn">رقم الدور</span>
                <span class="qp-col qp-col-time">وقت تسجيل الدور</span>
                <span class="qp-col qp-col-countdown">المتبقي</span>
                <span class="qp-col qp-col-status">الحالة</span>
                <span class="qp-col qp-col-actions">الإجراءات</span>
              </div>
              <div v-for="(a, i) in todayQueue" :key="a.id" class="qp-row" :class="'status-' + getStatusClass(a)">
                <div class="qp-col qp-col-patient">
                  <div class="qp-avatar" :style="{ background: avatarColor(a.full_name) }">{{ initials(a.full_name) }}</div>
                  <div class="qp-patient-info">
                    <span class="qp-name">{{ a.full_name }}</span>
                    <span class="qp-phone" v-if="a.phone">{{ a.phone }}</span>
                  </div>
                </div>
                <span class="qp-col qp-col-turn"><span class="qp-turn-badge">{{ i + 1 }}</span></span>
                <span class="qp-col qp-col-time"><span class="qp-time-badge">{{ to12hShort(a.start_time) || '---' }}</span></span>
                <span class="qp-col qp-col-countdown"><span v-if="a.start_time && a.status !== 'completed' && a.status !== 'missed'" class="qp-countdown-badge">{{ countdownReactive(a.appointment_date, a.start_time) }}</span><span v-else>—</span></span>
                <span class="qp-col qp-col-status">
                  <span class="qp-status" :class="'s-' + getStatusClass(a)">{{ getStatusText(a) }}</span>
                </span>
                <div class="qp-col qp-col-actions">
                  <button class="qp-action-btn" title="عرض" @click="selectPatient(a)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <div class="qp-options-wrap">
                    <button class="qp-action-btn" title="خيارات" @click.stop="toggleOptions(a.id)">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                    <transition name="dropdown">
                      <div v-if="openOptionsId === a.id" class="qp-options-dropdown" @click.stop>
                        <button v-if="a.status === 'arrived' || a.status === 'consulting'" @click="dischargeFromQueue(a)">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                          خرج المريض
                        </button>
                        <button @click="goToMedicalRecordForPatient(a)">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          السجل الطبي
                        </button>
                      </div>
                    </transition>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Archive Panel -->
        <div v-if="docTab === 'archive'" class="queue-panel">
          <div class="qp-header">
            <h2>أرشيف الحجوزات</h2>
            <input v-model="docArchiveDate" type="date" class="archive-date-input" @change="loadDocArchive()" />
          </div>
          <div v-if="docArchiveLoading" class="qp-empty"><div class="spinner"></div></div>
          <div v-else-if="docArchiveList.length === 0" class="qp-empty">
            <p>لا توجد حجوزات في هذا التاريخ</p>
          </div>
          <div v-else class="table-wrap">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">#</th>
                  <th>المريض</th>
                  <th>الهاتف</th>
                  <th>الوقت</th>
                  <th>الأتعاب</th>
                  <th>الحالة</th>
                  <th>الدفوع</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in docArchiveList" :key="a.id">
                  <td class="cell-muted col-seq">{{ i + 1 }}</td>
                  <td class="cell-name">{{ a.full_name || '—' }}</td>
                  <td class="cell-muted">{{ a.phone || '—' }}</td>
                  <td><span class="slot-time-badge">{{ to12hShort(a.start_time) || '—' }}</span></td>
                  <td class="cell-muted">{{ a.consultation_fee ? Number(a.consultation_fee).toLocaleString() + ' د.ع' : '—' }}</td>
                  <td><span class="qt-badge" :class="'badge-' + (a.status || 'booked')">{{ { booked: 'محجوز', arrived: 'دخل', completed: 'اكتمل', missed: 'غياب' }[a.status || 'booked'] }}</span></td>
                  <td><span v-if="a.status === 'completed'" class="pay-badge pay-paid">مدفوع</span><span v-else class="pay-badge pay-unpaid">—</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="side-panel">
          <button class="sp-btn sp-blue" @click="showAddModal = true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
            إضافة مريض جديد
          </button>
          <button class="sp-btn sp-pink" @click="goToMedicalRecord">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
            كتابة وصفة جديدة
          </button>

          <div class="recent-card">
            <h3>آخر المرضى الذين تم عرضهم</h3>
            <div v-if="recentViewed.length === 0" class="rc-empty">
              <p>لم تتم مراجعة أي مريض بعد</p>
            </div>
            <div v-else class="rc-list">
              <div v-for="p in recentViewed" :key="p.id + '-' + p.viewedAt" class="rc-item" @click="selectPatient(p)">
                <div class="rc-avatar" :style="{ background: avatarColor(p.full_name) }">{{ initials(p.full_name) }}</div>
                <div class="rc-info">
                  <span class="rc-name">{{ p.full_name }}</span>
                  <span class="rc-file">{{ p.file_number || 'بدون ملف' }}</span>
                  <span class="rc-time">{{ p.viewedAt }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SEARCH RESULTS -->
      <div v-if="searchQuery && !selectedPatient && !fullFileMode" class="search-results">
        <div v-if="searching" class="loading-state"><div class="spinner"></div><p>جاري البحث...</p></div>
        <div v-else-if="searchResults.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
          <p>لا يوجد نتائج مطابقة لـ "{{ searchQuery }}"</p>
        </div>
        <div v-else class="results-list">
          <div v-for="p in searchResults" :key="p.id" class="result-card" @click="selectPatient(p)">
            <div class="rc-avatar" :style="{ background: avatarColor(p.full_name) }">{{ initials(p.full_name) }}</div>
            <div class="rc-info">
              <span class="rc-name">{{ p.full_name }}</span>
              <span class="rc-meta">
                <span v-if="p.phone">{{ p.phone }}</span>
                <span v-if="p.file_number"> · رقم الملف: {{ p.file_number }}</span>
                <span v-if="p.age"> · {{ p.age }} سنة</span>
              </span>
            </div>
            <div class="rc-actions">
              <button class="rc-btn rc-btn-diag" @click.stop="startDiagnosis(p)" title="تشخيص">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </button>
              <button class="rc-btn rc-btn-rx" @click.stop="startPrescription(p)" title="وصفة طبية">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SELECTED PATIENT PROFILE -->
      <div v-if="selectedPatient && !fullFileMode && !workspaceMode" class="profile-section">
        <div class="profile-header">
          <button class="back-btn" @click="clearSelection">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div v-if="autoOpenedAppointmentId" class="auto-open-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            دخل للعيادة — فتح تلقائياً
          </div>
          <div class="ph-avatar" :style="{ background: avatarColor(selectedPatient.full_name) }">{{ initials(selectedPatient.full_name) }}</div>
          <div class="ph-info">
            <h2>{{ selectedPatient.full_name }}</h2>
            <p>
              <span v-if="selectedPatient.phone">{{ selectedPatient.phone }}</span>
              <span v-if="selectedPatient.age"> · {{ selectedPatient.age }} سنة</span>
              <span v-if="selectedPatient.gender"> · {{ selectedPatient.gender }}</span>
              <span v-if="selectedPatient.blood_type"> · {{ selectedPatient.blood_type }}</span>
            </p>
          </div>
          <button v-if="currentAppointmentForPatient" class="btn-discharge-header" @click="dischargePatient">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            خرج المريض
          </button>
        </div>

        <div class="profile-info-grid">
          <div class="info-chip" v-if="selectedPatient.file_number">
            <span class="ic-label">رقم الملف</span>
            <span class="ic-value">{{ selectedPatient.file_number }}</span>
          </div>
          <div class="info-chip" v-if="selectedPatient.birth_date">
            <span class="ic-label">تاريخ الميلاد</span>
            <span class="ic-value">{{ selectedPatient.birth_date }}</span>
          </div>
          <div class="info-chip" v-if="selectedPatient.weight">
            <span class="ic-label">الوزن</span>
            <span class="ic-value">{{ selectedPatient.weight }} كغم</span>
          </div>
          <div class="info-chip" v-if="selectedPatient.height">
            <span class="ic-label">الطول</span>
            <span class="ic-value">{{ selectedPatient.height }} سم</span>
          </div>
          <div class="info-chip" v-if="selectedPatient.address">
            <span class="ic-label">العنوان</span>
            <span class="ic-value">{{ selectedPatient.address }}</span>
          </div>
          <div class="info-chip" v-if="selectedPatient.chronic_disease">
            <span class="ic-label">مرض مزمن</span>
            <span class="ic-value">{{ selectedPatient.chronic_disease }}</span>
          </div>
        </div>

        <div class="patient-actions">
          <h3 class="section-title">إجراءات سريعة</h3>
          <div class="pa-grid">
            <button class="pa-card pa-blue" @click="startDiagnosis(selectedPatient)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <span>تشخيص</span>
            </button>
            <button class="pa-card pa-pink" @click="startPrescription(selectedPatient)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              <span>وصفة طبية</span>
            </button>
            <button class="pa-card pa-gold" @click="openFullFile(selectedPatient)">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <span>الملف الكامل</span>
            </button>
          </div>
        </div>

      </div>

      <!-- WORKSPACE (A5 Sheet — same as MedicalRecord) -->
      <div v-if="workspaceMode && selectedPatient" class="workspace-section">
          <div class="ws-toolbar">
            <button class="back-btn" @click="workspaceMode = null">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div class="ws-toolbar-title">
              <h3>{{ workspaceMode === 'diagnosis' ? 'تشخيص' : 'وصفة طبية' }} — {{ selectedPatient.full_name }}</h3>
            </div>
            <div class="ws-toolbar-actions">
              <button class="btn btn-primary btn-lg" @click="saveWorkspace" :disabled="savingWorkspace || !workspaceContent.trim()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>{{ savingWorkspace ? 'جاري الحفظ...' : 'حفظ' }}</span>
              </button>
              <button class="btn btn-gold btn-lg" @click="previewAndPrint" :disabled="!workspaceContent.trim()">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>طباعة</span>
              </button>
              <button v-if="currentAppointmentForPatient" class="btn btn-danger btn-lg" @click="dischargePatient">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                خرج المريض
              </button>
            </div>
          </div>
          <div class="a5-sheet-wrap">
            <div class="a5-sheet">
              <div class="a5-header">
                <span class="a5-clinic-name">{{ doctorInfo?.clinic_name || doctorDisplayName }}</span>
                <span v-if="doctorInfo?.doctor_name && doctorInfo.doctor_name !== doctorInfo.clinic_name" class="a5-doctor-name">{{ doctorInfo.doctor_name }}</span>
                <span class="a5-doctor-bio">{{ doctorInfo?.doctor_bio || '' }}</span>
              </div>
              <div class="a5-patient-row">
                <div class="a5-patient-field">
                  <span class="a5-field-label">اسم المريض</span>
                  <span class="a5-field-value">{{ selectedPatient.full_name }}</span>
                </div>
                <div class="a5-patient-field">
                  <span class="a5-field-label">العمر</span>
                  <span class="a5-field-value">{{ selectedPatient.age || 'غير محدد' }}</span>
                </div>
                <div class="a5-patient-field">
                  <span class="a5-field-label">التاريخ</span>
                  <span class="a5-field-value">{{ todayStr }}</span>
                </div>
              </div>
              <div class="a5-rx">
                <span class="a5-rx-label">{{ workspaceMode === 'diagnosis' ? 'التشخيص' : 'Rx/' }}</span>
                <textarea v-model="workspaceContent" class="a5-rx-textarea" :placeholder="workspaceMode === 'diagnosis' ? 'اكتب تشخيص المريض هنا...' : 'اكتب الوصفة الطبية هنا...'" rows="12"></textarea>
              </div>
              <div class="a5-footer">
                <span class="a5-footer-text">{{ doctorInfo?.clinic_address || '' }}</span>
                <span class="a5-footer-text">{{ doctorInfo?.phone1 || '' }}</span>
              </div>
            </div>
          </div>
        </div>

      <!-- FULL PATIENT FILE -->
      <div v-if="fullFileMode" class="full-file-section">
        <div class="ff-header">
          <button class="back-btn" @click="fullFileMode = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <h2>الملف الكامل — {{ fullFilePatient?.full_name }}</h2>
        </div>

        <div class="ff-patient-card">
          <div class="ffc-avatar" :style="{ background: avatarColor(fullFilePatient?.full_name) }">{{ initials(fullFilePatient?.full_name) }}</div>
          <div class="ffc-info">
            <h3>{{ fullFilePatient?.full_name }}</h3>
            <div class="ffc-chips">
              <span v-if="fullFilePatient?.phone">📞 {{ fullFilePatient.phone }}</span>
              <span v-if="fullFilePatient?.age">🎂 {{ fullFilePatient.age }} سنة</span>
              <span v-if="fullFilePatient?.gender">👤 {{ fullFilePatient.gender }}</span>
              <span v-if="fullFilePatient?.blood_type">🩸 {{ fullFilePatient.blood_type }}</span>
              <span v-if="fullFilePatient?.weight">⚖ {{ fullFilePatient.weight }} كغم</span>
              <span v-if="fullFilePatient?.height">📏 {{ fullFilePatient.height }} سم</span>
              <span v-if="fullFilePatient?.file_number">📁 رقم الملف: {{ fullFilePatient.file_number }}</span>
            </div>
            <div class="ffc-chips" v-if="fullFilePatient?.address || fullFilePatient?.chronic_disease">
              <span v-if="fullFilePatient?.address">🏠 {{ fullFilePatient.address }}</span>
              <span v-if="fullFilePatient?.chronic_disease" class="chronic-tag">⚠ {{ fullFilePatient.chronic_disease }}</span>
            </div>
          </div>
        </div>

        <div v-if="fullFileLoading" class="ff-loading"><div class="spinner"></div><p>جاري تحميل الملف...</p></div>

        <div v-else class="ff-timeline">
          <h3 class="ff-section-title">الزيارات والسجل الطبي <span class="ff-count">({{ fullFileVisits.length }} زيارة)</span></h3>
          <div v-if="fullFileVisits.length === 0" class="ff-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>لا توجد زيارات مسجلة</p>
          </div>
          <div v-else class="tl-list">
            <div v-for="v in fullFileVisits" :key="v.appointment_id" class="tl-card">
              <div class="tl-dot" :class="'tl-' + (v.status || 'booked')"></div>
              <div class="tl-line"></div>
              <div class="tl-body">
                <div class="tl-head">
                  <span class="tl-date">{{ v.appointment_date || '---' }}</span>
                  <span class="tl-status" :class="'tls-' + (v.status || 'booked')">{{ statusLabel(v.status) }}</span>
                </div>
                <div v-if="v.diagnosis" class="tl-section">
                  <div class="tls-label" @click="openPrintPreview('diagnosis', v.diagnosis, fullFilePatient)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    التشخيص — اضغط للعرض والطباعة
                  </div>
                  <div class="tls-preview">{{ v.diagnosis.substring(0, 120) }}{{ v.diagnosis.length > 120 ? '...' : '' }}</div>
                </div>
                <div v-if="v.prescription" class="tl-section">
                  <div class="tls-label rx" @click="openPrintPreview('prescription', v.prescription, fullFilePatient)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
                    الوصفة الطبية — اضغط للعرض والطباعة
                  </div>
                  <div class="tls-preview">{{ v.prescription.substring(0, 120) }}{{ v.prescription.length > 120 ? '...' : '' }}</div>
                </div>
                <div v-if="v.notes" class="tl-section tl-notes">
                  <span class="tls-label notes">ملاحظات:</span> {{ v.notes }}
                </div>
                <div v-if="v.consultation_fee" class="tl-fee">أتعاب: {{ Number(v.consultation_fee).toLocaleString() }} د.ع</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Documents Section -->
        <div class="docs-section">
          <div class="ff-section-title" style="display: flex; align-items: center; justify-content: space-between;">
            <span>المستندات والمرفقات</span>
            <label class="doc-upload-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              إضافة مستند
              <input type="file" accept="image/*,.pdf" @change="uploadDocument" style="display:none;" />
            </label>
          </div>
          <div v-if="fullFileDocs.length === 0" class="ff-empty">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>لا توجد مستندات مرفقة</p>
          </div>
          <div v-else class="docs-grid">
            <div v-for="doc in fullFileDocs" :key="doc.id" class="doc-card" @click="viewDocument(doc)">
              <div class="doc-thumb">
                <img v-if="doc.file_url" :src="doc.file_url" :alt="doc.title" loading="lazy" />
                <svg v-else viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#cbd5e1" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="doc-info">
                <span class="doc-title">{{ doc.title || 'مستند' }}</span>
                <span class="doc-date">{{ doc.created_at ? new Date(doc.created_at).toLocaleDateString('ar-IQ') : '' }}</span>
              </div>
              <button class="doc-delete" @click.stop="deleteDocument(doc.id)" title="حذف">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- DOCUMENT VIEWER MODAL -->
      <div v-if="showDocViewer" class="modal-overlay" @click.self="showDocViewer = false">
        <div class="print-modal" style="max-width: 800px;">
          <div class="pm-header">
            <h3>{{ viewingDoc?.title || 'مستند' }}</h3>
            <button class="pm-close" @click="showDocViewer = false">✕</button>
          </div>
          <div class="pm-body" style="text-align: center;">
            <img v-if="viewingDoc?.file_url" :src="viewingDoc.file_url" style="max-width: 100%; max-height: 60vh; border-radius: 12px;" />
            <p v-if="viewingDoc?.description" style="color: #64748b; margin-top: 12px;">{{ viewingDoc.description }}</p>
          </div>
        </div>
      </div>

      <!-- ADD DOCUMENT MODAL -->
      <div v-if="showAddDocModal" class="modal-overlay" @click.self="showAddDocModal = false">
        <div class="modal" style="max-width: 450px;">
          <header class="modal-header">
            <h3>إضافة مستند</h3>
            <button class="icon-btn" @click="showAddDocModal = false">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="form-field" style="margin-bottom: 14px;">
              <label>عنوان المستند</label>
              <input v-model="newDocTitle" type="text" placeholder="مثال: تقرير أشعة" />
            </div>
            <div class="form-field">
              <label>ملاحظات (اختياري)</label>
              <textarea v-model="newDocDesc" rows="2" placeholder="وصف مختصر..."></textarea>
            </div>
            <div style="margin-top: 16px; text-align: center;">
              <div v-if="newDocPreview" style="margin-bottom: 12px;">
                <img :src="newDocPreview" style="max-width: 100%; max-height: 200px; border-radius: 12px;" />
              </div>
              <label class="doc-upload-btn" style="display: inline-flex;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                {{ newDocFile ? 'تم اختيار الملف' : 'اختر ملف' }}
                <input type="file" accept="image/*,.pdf" @change="onDocFileSelect" style="display:none;" />
              </label>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="btn btn-ghost" @click="showAddDocModal = false">إلغاء</button>
            <button class="btn btn-primary" @click="confirmAddDocument" :disabled="uploadingDoc || !newDocFile">
              {{ uploadingDoc ? 'جاري الرفع...' : 'إضافة' }}
            </button>
          </footer>
        </div>
      </div>

      <!-- PRINTABLE PREVIEW MODAL — DIAGNOSIS -->
      <div v-if="showPrintPreview && printType === 'diagnosis'" class="modal-overlay" @click.self="showPrintPreview = false">
        <div class="print-modal">
          <div class="pm-header">
            <h3>التشخيص</h3>
            <div class="pm-actions">
              <button class="pm-print-btn" @click="printContent">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                طباعة
              </button>
              <button class="pm-close" @click="showPrintPreview = false">✕</button>
            </div>
          </div>
          <div class="pm-body" ref="printArea">
            <div class="print-doc diagnosis-doc">
              <div class="pd-header">
                <div class="pd-clinic-name">{{ doctorDisplayName }}</div>
                <div class="pd-title">تشخيص طبي</div>
              </div>
              <div class="pd-patient-row">
                <span><strong>المريض:</strong> {{ printPatientName }}</span>
                <span><strong>العمر:</strong> {{ printPatientAge || '---' }}</span>
                <span><strong>التاريخ:</strong> {{ new Date().toLocaleDateString('ar-IQ') }}</span>
              </div>
              <div class="pd-divider"></div>
              <div class="pd-content" v-html="formatContent(printContentText)"></div>
              <div class="pd-footer">
                <div class="pd-signature">{{ doctorDisplayName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PRINTABLE PREVIEW MODAL — PRESCRIPTION -->
      <div v-if="showPrintPreview && printType === 'prescription'" class="modal-overlay" @click.self="showPrintPreview = false">
        <div class="print-modal">
          <div class="pm-header">
            <h3>وصفة طبية</h3>
            <div class="pm-actions">
              <button class="pm-print-btn" @click="printContent">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                طباعة
              </button>
              <button class="pm-close" @click="showPrintPreview = false">✕</button>
            </div>
          </div>
          <div class="pm-body" ref="printArea2">
            <div class="print-doc prescription-doc">
              <div class="pd-header rx-header">
                <div class="pd-clinic-name">{{ doctorDisplayName }}</div>
                <div class="pd-title">وصفة طبية</div>
              </div>
              <div class="pd-patient-row">
                <span><strong>المريض:</strong> {{ printPatientName }}</span>
                <span><strong>العمر:</strong> {{ printPatientAge || '---' }}</span>
                <span><strong>التاريخ:</strong> {{ new Date().toLocaleDateString('ar-IQ') }}</span>
              </div>
              <div class="pd-divider rx-divider"></div>
              <div class="pd-content" v-html="formatContent(printContentText)"></div>
              <div class="pd-footer">
                <div class="pd-signature">{{ doctorDisplayName }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ADD PATIENT MODAL -->
      <div v-if="showAddModal && !fullFileMode" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal">
          <header class="modal-header">
            <h3>إضافة مريض جديد</h3>
            <button class="icon-btn" @click="showAddModal = false">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </header>
          <form id="patient-form" class="modal-body" @submit.prevent="savePatient">
            <div class="form-grid">
              <div class="form-field">
                <label>الاسم الكامل <em>*</em></label>
                <input v-model="newPatient.full_name" type="text" required placeholder="مثال: أحمد محمد علي" />
              </div>
              <div class="form-field">
                <label>العمر</label>
                <input v-model.number="newPatient.age" type="number" min="0" max="130" placeholder="مثال: 35" />
              </div>
              <div class="form-field">
                <label>الجنس</label>
                <select v-model="newPatient.gender">
                  <option value="">— اختر —</option>
                  <option value="ذكر">ذكر</option>
                  <option value="أنثى">أنثى</option>
                </select>
              </div>
              <div class="form-field">
                <label>فصيلة الدم</label>
                <select v-model="newPatient.blood_type">
                  <option value="">— اختر —</option>
                  <option v-for="bt in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bt" :value="bt">{{ bt }}</option>
                </select>
              </div>
              <div class="form-field">
                <label>الوزن (كغم)</label>
                <input v-model.number="newPatient.weight" type="number" min="0" max="500" step="0.1" placeholder="مثال: 70" />
              </div>
              <div class="form-field">
                <label>الطول (سم)</label>
                <input v-model.number="newPatient.height" type="number" min="0" max="300" step="0.1" placeholder="مثال: 170" />
              </div>
              <div class="form-field">
                <label>رقم الهاتف</label>
                <input v-model="newPatient.phone" type="tel" placeholder="مثال: 07701234567" />
              </div>
              <div class="form-field form-field-full">
                <label>العنوان</label>
                <input v-model="newPatient.address" type="text" placeholder="مثال: بغداد - الكرادة" />
              </div>
              <div class="form-field form-field-full">
                <label>مرض مزمن</label>
                <textarea v-model="newPatient.chronic_disease" rows="2" placeholder="اكتب هنا إن كان المريض يعاني من مرض مزمن..."></textarea>
              </div>
              <div class="form-field form-field-full">
                <label>ملاحظات</label>
                <textarea v-model="newPatient.notes" rows="2" placeholder="ملاحظات إضافية عن المريض..."></textarea>
              </div>
            </div>
          </form>
          <footer class="modal-footer">
            <button type="button" class="btn btn-ghost" @click="showAddModal = false">إلغاء</button>
            <button type="submit" class="btn btn-primary" form="patient-form" @click="savePatient" :disabled="savingPatient || !newPatient.full_name.trim()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              <span>{{ savingPatient ? 'جاري الحفظ...' : 'حفظ' }}</span>
            </button>
          </footer>
        </div>
      </div>

      <!-- BACKUP MODAL -->
      <div v-if="showBackupModal" class="modal-overlay" @click.self="showBackupModal = false">
        <div class="modal">
          <header class="modal-header">
            <h3>النسخ الاحتياطي</h3>
            <button class="icon-btn" @click="showBackupModal = false">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </header>
          <div class="modal-body" style="text-align: center; padding: 40px 24px;">
            <div v-if="!backupData" style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(214,158,31,0.1); display: grid; place-items: center; color: #d69e1f;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </div>
              <p style="color: #64748b; font-size: 0.88rem; margin: 0;">سيتم تصدير جميع بيانات العيادة كملف JSON</p>
              <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">المرضى · الحجوزات · الوصفات · التشخيصات · الأقساط · المصروفات</p>
              <button class="btn btn-gold" @click="runBackup" :disabled="backingUp" style="background: linear-gradient(135deg, #d69e1f, #b45309); color: #fff; padding: 12px 28px; border-radius: 12px; border: none; font-size: 0.9rem; font-weight: 700; cursor: pointer; font-family: inherit;">
                <template v-if="backingUp">جاري التصدير...</template>
                <template v-else>تصدير البيانات</template>
              </button>
            </div>
            <div v-else style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
              <div style="width: 64px; height: 64px; border-radius: 16px; background: rgba(16,185,129,0.1); display: grid; place-items: center; color: #10b981;">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <p style="color: #059669; font-size: 0.95rem; font-weight: 700; margin: 0;">تم التصدير بنجاح!</p>
              <p style="color: #94a3b8; font-size: 0.78rem; margin: 0;">اضغط للتحميل</p>
              <button class="btn btn-primary" @click="downloadBackup" style="padding: 12px 28px;">تحميل ملف JSON</button>
              <button class="btn btn-ghost" @click="backupData = null" style="font-size: 0.82rem;">تصدير مرة أخرى</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, getDoc, doc, onSnapshot, limit, updateDoc } from 'firebase/firestore'
import { patientsRepo, diagnosesRepo, prescriptionsRepo, appointmentsRepo, auditLogsRepo, backupRepo, patientDocsRepo } from '@/services/clinic'
import { to12h, to12hShort, formatArabicDate, timeUntil, timeAgoAr, playNotifSound } from '@/utils/time'

const now = ref(Date.now())
let timerInterval = null
const countdownReactive = (date, time) => { now.value; return timeUntil(date, time) }

const router = useRouter()
const authStore = useAuthStore()

const clinicId = computed(() => authStore.clinicId)
const uid = computed(() => authStore.uid)
const clinicName = ref('')
const doctorPhoto = ref('')
const doctorInfo = ref(null)
const doctorDisplayName = computed(() => authStore.fullName || '')
const doctorInitials = computed(() => {
  const n = authStore.fullName || ''
  return n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() || 'U'
})

const todayStr = computed(() => new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }))
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'صباح الخير' : h < 18 ? 'مساء الخير' : 'مساء الخير' })

const patients = ref([])
const appointments = ref([])
const prescriptions = ref([])

const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const selectedPatient = ref(null)
const workspaceMode = ref(null)
const workspaceContent = ref('')
const savingWorkspace = ref(false)
const showAddModal = ref(false)
const savingPatient = ref(false)
const toast = ref({ show: false, message: '', type: 'success' })

const docTab = ref('queue')
const docArchiveDate = ref(new Date().toISOString().slice(0, 10))
const docArchiveList = ref([])
const docArchiveLoading = ref(false)

const notifications = ref([])
const unreadNotifCount = ref(0)
const showNotifPanel = ref(false)
const bellBtnRef = ref(null)
const notifDropdownStyle = computed(() => {
  if (!bellBtnRef.value) return {}
  const rect = bellBtnRef.value.getBoundingClientRect()
  return { position: 'fixed', top: (rect.bottom + 8) + 'px', right: (window.innerWidth - rect.right) + 'px' }
})
let unsubscribeNotifs = null

function toggleNotifPanel() { showNotifPanel.value = !showNotifPanel.value }

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now - date) / 1000)
  if (diff < 60) return 'الآن'
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`
  return date.toLocaleDateString('ar-IQ', { month: 'short', day: 'numeric' })
}

async function markAllNotifsRead() {
  try {
    const unread = notifications.value.filter(n => !n.read)
    await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })))
    notifications.value = notifications.value.map(n => ({ ...n, read: true }))
  } catch (e) {}
}

function openNotif(n) {
  if (!n.read) {
    updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(() => {})
    const idx = notifications.value.findIndex(x => x.id === n.id)
    if (idx !== -1) notifications.value[idx] = { ...notifications.value[idx], read: true }
  }
  showNotifPanel.value = false
  router.push('/clinic/' + clinicId.value + '/notifications')
}

let searchTimeout = null

const newPatient = ref({ full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' })

const showPrintPreview = ref(false)
const printType = ref('diagnosis')
const printContentText = ref('')
const printPatientName = ref('')
const printPatientAge = ref(null)
const printArea = ref(null)
const printArea2 = ref(null)

const fullFileMode = ref(false)
const fullFilePatient = ref(null)
const fullFileVisits = ref([])
const fullFileLoading = ref(false)

const totalPatients = computed(() => patients.value.length)
const totalPrescriptions = computed(() => prescriptions.value.length)
const todayAppointments = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value.filter(a => a.appointment_date === today).length
})

const allTodayAppointments = ref([])

const todayRevenue = computed(() => {
  return allTodayAppointments.value
    .filter(a => a.status === 'completed' && a.consultation_fee)
    .reduce((sum, a) => sum + (Number(a.consultation_fee) || 0), 0)
})
const completedToday = computed(() => allTodayAppointments.value.filter(a => a.status === 'completed').length)
const missedToday = computed(() => allTodayAppointments.value.filter(a => a.status === 'missed').length)
const totalBooked = computed(() => allTodayAppointments.value.length)
const underConsultation = computed(() => allTodayAppointments.value.filter(a => a.status === 'arrived' || a.status === 'consulting').length)
const waitingCount = computed(() => allTodayAppointments.value.filter(a => a.status === 'arrived').length)

const currentAppointmentForPatient = computed(() => {
  if (!selectedPatient.value) return null
  return allTodayAppointments.value.find(a =>
    (a.patient_id || a.patientId) === selectedPatient.value.id &&
    ['arrived', 'consulting', 'booked'].includes(a.status)
  ) || null
})

const recentPatients = computed(() => [...patients.value].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 8))

const recentViewed = ref([])
const maxRecent = 6

function addToRecentViewed(patient) {
  const exists = recentViewed.value.findIndex(p => p.id === patient.id)
  if (exists !== -1) recentViewed.value.splice(exists, 1)
  recentViewed.value.unshift({
    ...patient,
    viewedAt: new Date().toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })
  })
  if (recentViewed.value.length > maxRecent) recentViewed.value.pop()
}

const openOptionsId = ref(null)
function toggleOptions(id) { openOptionsId.value = openOptionsId.value === id ? null : id }
function closeOptions() { openOptionsId.value = null }

const colors = ['#1150c9','#0d9488','#d69e1f','#8b5cf6','#ec4899','#ef4444','#06b6d4','#f97316']
function avatarColor(name) { if (!name) return colors[0]; let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length] }
function initials(name) { if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() }

function getStatusClass(a) {
  const s = a.status || 'booked'
  if (s === 'arrived') return 'arrived'
  if (s === 'consulting') return 'consulting'
  if (s === 'completed') return 'completed'
  if (s === 'missed') return 'missed'
  return 'waiting'
}
function getStatusText(a) {
  const s = typeof a === 'string' ? a : (a?.status || 'booked')
  const map = { booked: 'محجوز', arrived: 'موجود', consulting: 'تحت الاستشارة', completed: 'اكتمل', missed: 'لم يحضر' }
  return map[s] || s
}
function statusLabel(a) { return getStatusText(a) }

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function onSearch() {
  clearTimeout(searchTimeout)
  const q = searchQuery.value.trim()
  if (!q) { searchResults.value = []; return }
  searching.value = true
  searchTimeout = setTimeout(async () => {
    try { searchResults.value = await patientsRepo.list(clinicId.value, q) } catch (e) { searchResults.value = [] }
    searching.value = false
  }, 300)
}

function clearSearch() { searchQuery.value = ''; searchResults.value = []; selectedPatient.value = null }

function selectPatient(p) {
  selectedPatient.value = p
  searchQuery.value = ''
  searchResults.value = []
  workspaceMode.value = null
  workspaceContent.value = ''
  addToRecentViewed(p)
  openOptionsId.value = null
  autoOpenedAppointmentId.value = null
}

function clearSelection() { selectedPatient.value = null; workspaceMode.value = null; workspaceContent.value = ''; autoOpenedAppointmentId.value = null }

async function markEntered(a) {
  try { await updateDoc(doc(db, 'appointments', a.id), { entered: 1, status: 'consulting' }); openOptionsId.value = null } catch (e) {}
}
async function markMissed(a) {
  try { await updateDoc(doc(db, 'appointments', a.id), { missed: 1, status: 'missed' }); openOptionsId.value = null } catch (e) {}
}

async function dischargePatient() {
  const a = currentAppointmentForPatient.value
  if (!a) return
  try {
    if (workspaceContent.value.trim() && workspaceMode.value && selectedPatient.value) {
      const today = new Date().toISOString().split('T')[0]
      let appts = await appointmentsRepo.listForPatient(clinicId.value, selectedPatient.value.id)
      let todayAppt = appts.find(ap => ap.appointment_date === today)
      if (!todayAppt) {
        const result = await appointmentsRepo.create(clinicId.value, selectedPatient.value.id, today, null, null, null, null, null, {
          full_name: selectedPatient.value.full_name, phone: selectedPatient.value.phone || null,
          age: selectedPatient.value.age || null, status: 'consulting', doctor_id: clinicId.value
        })
        todayAppt = { id: result.id, appointment_date: today }
      }
      if (workspaceMode.value === 'diagnosis') {
        await diagnosesRepo.save(clinicId.value, todayAppt.id, selectedPatient.value.id, workspaceContent.value)
      } else {
        await prescriptionsRepo.save(clinicId.value, todayAppt.id, selectedPatient.value.id, workspaceContent.value)
      }
    }
    await appointmentsRepo.complete(a.id, a.consultation_fee || 0)
    auditLogsRepo.log(clinicId.value, 'update', 'خروج مريض: ' + (selectedPatient.value?.full_name || '')).catch(() => {})
    showToast('خرج المريض — ' + selectedPatient.value.full_name)
    selectedPatient.value = null
    workspaceMode.value = null
    workspaceContent.value = ''
  } catch (e) { showToast('خطأ', 'error') }
}

async function dischargeFromQueue(a) {
  openOptionsId.value = null
  try {
    await appointmentsRepo.complete(a.id, a.consultation_fee || 0)
    auditLogsRepo.log(clinicId.value, 'update', 'خروج مريض من الطابور: ' + (a.full_name || '')).catch(() => {})
    showToast('خرج المريض — ' + a.full_name)
  } catch (e) { showToast('خطأ', 'error') }
}

function startDiagnosis(patient) {
  selectedPatient.value = patient
  searchQuery.value = ''
  searchResults.value = []
  workspaceMode.value = 'diagnosis'
  workspaceContent.value = ''
}

function startPrescription(patient) {
  selectedPatient.value = patient
  searchQuery.value = ''
  searchResults.value = []
  workspaceMode.value = 'prescription'
  workspaceContent.value = ''
}

function startAppointment(patient) { router.push(`/clinic/${clinicId.value}/owner/appointments?patient=${patient.id}`) }
function goToMedicalRecord() { router.push(`/clinic/${clinicId.value}/owner/medical-record`) }
function goToMedicalRecordForPatient(a) { openOptionsId.value = null; router.push(`/clinic/${clinicId.value}/owner/medical-record?patient=${a.patient_id || a.patientId}`) }

async function loadDocArchive() {
  docArchiveLoading.value = true
  try { docArchiveList.value = await appointmentsRepo.listByDate(clinicId.value, docArchiveDate.value) } catch (e) { docArchiveList.value = [] }
  docArchiveLoading.value = false
}

function openPrintPreview(type, content, patient) {
  printType.value = type
  printContentText.value = content
  printPatientName.value = patient?.full_name || selectedPatient.value?.full_name || ''
  printPatientAge.value = patient?.age || selectedPatient.value?.age || null
  showPrintPreview.value = true
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}
function formatContent(text) {
  if (!text) return ''
  return text.split('\n').map(line => {
    line = escapeHtml(line)
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>')
    if (line.trim() === '') return '<br>'
    if (line.trim().startsWith('- ')) return '<div class="rx-item">' + line.substring(2) + '</div>'
    return '<div>' + line + '</div>'
  }).join('')
}

function printContent() {
  const area = printType.value === 'prescription' ? printArea2.value : printArea.value
  const content = area?.innerHTML
  if (!content) return
  const win = window.open('', '_blank')
  win.document.write(`
    <html dir="rtl"><head><title>طباعة</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; direction: rtl; padding: 20px; }
      .print-doc { max-width: 600px; margin: 0 auto; }
      .pd-header { text-align: center; padding-bottom: 12px; border-bottom: 3px solid #1150c9; margin-bottom: 16px; }
      .pd-clinic-name { font-size: 1.2rem; font-weight: 800; color: #1150c9; }
      .pd-title { font-size: 0.9rem; color: #64748b; margin-top: 4px; }
      .rx-header { border-bottom-color: #D81B8A; }
      .rx-header .pd-clinic-name { color: #D81B8A; }
      .pd-patient-row { display: flex; gap: 20px; font-size: 0.85rem; color: #475569; margin-bottom: 12px; }
      .pd-divider { height: 1px; background: #e5e7eb; margin-bottom: 16px; }
      .rx-divider { background: #fce7f3; }
      .pd-content { font-size: 0.9rem; line-height: 1.8; color: #1e293b; min-height: 120px; }
      .pd-content .rx-item { padding: 4px 0; border-bottom: 1px dashed #f1f5f9; }
      .pd-footer { margin-top: 30px; text-align: left; }
      .pd-signature { font-size: 0.85rem; font-weight: 700; color: #1150c9; border-top: 1px solid #e5e7eb; padding-top: 8px; display: inline-block; }
      @media print { body { padding: 10px; } }
    </style></head><body>${content}</body></html>
  `)
  win.document.close()
  setTimeout(() => { win.print() }, 400)
}

async function openFullFile(patient) {
  fullFilePatient.value = patient
  fullFileVisits.value = []
  fullFileMode.value = true
  fullFileLoading.value = true
  selectedPatient.value = null
  workspaceMode.value = null
  try {
    const [appts, diagnoses, prescriptionsData, docs] = await Promise.all([
      appointmentsRepo.listForPatient(clinicId.value, patient.id),
      diagnosesRepo.listHistory(clinicId.value, patient.id).catch(() => []),
      prescriptionsRepo.listHistory(clinicId.value, patient.id).catch(() => []),
      patientDocsRepo.list(clinicId.value, patient.id).catch(() => [])
    ])
    fullFileDocs.value = docs
    const diagMap = {}
    diagnoses.forEach(d => { diagMap[d.appointment_id] = d.content })
    const prescMap = {}
    prescriptionsData.forEach(p => { prescMap[p.appointment_id] = p.content })
    fullFileVisits.value = appts.map(a => ({
      appointment_id: a.id,
      appointment_date: a.appointment_date,
      status: a.status || (a.entered === 1 ? 'consulting' : a.missed === 1 ? 'missed' : 'booked'),
      diagnosis: diagMap[a.id] || '',
      prescription: prescMap[a.id] || '',
      notes: a.notes || '',
      consultation_fee: a.consultation_fee,
      start_time: a.start_time
    })).sort((a, b) => (b.appointment_date || '').localeCompare(a.appointment_date || ''))
  } catch (e) { showToast('خطأ في تحميل الملف', 'error') }
  finally { fullFileLoading.value = false }
}

async function saveWorkspace() {
  if (!selectedPatient.value || !workspaceContent.value.trim()) return
  savingWorkspace.value = true
  try {
    const today = new Date().toISOString().split('T')[0]
    let appts = await appointmentsRepo.listForPatient(clinicId.value, selectedPatient.value.id)
    let todayAppt = appts.find(a => a.appointment_date === today)
    if (!todayAppt) {
      const result = await appointmentsRepo.create(clinicId.value, selectedPatient.value.id, today, null, null, null, null, null, {
        full_name: selectedPatient.value.full_name,
        phone: selectedPatient.value.phone || null,
        age: selectedPatient.value.age || null,
        status: 'consulting',
        doctor_id: clinicId.value
      })
      todayAppt = { id: result.id, appointment_date: today }
    }
    if (workspaceMode.value === 'diagnosis') {
      await diagnosesRepo.save(clinicId.value, todayAppt.id, selectedPatient.value.id, workspaceContent.value)
    } else {
      await prescriptionsRepo.save(clinicId.value, todayAppt.id, selectedPatient.value.id, workspaceContent.value)
    }
    auditLogsRepo.log(clinicId.value, 'update', (workspaceMode.value === 'diagnosis' ? 'حفظ تشخيص' : 'حفظ وصفة') + ' — ' + (selectedPatient.value?.full_name || '')).catch(() => {})
    showToast(workspaceMode.value === 'diagnosis' ? 'تم حفظ التشخيص' : 'تم حفظ الوصفة')
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
  finally { savingWorkspace.value = false }
}

function previewAndPrint() {
  if (!workspaceContent.value.trim() || !selectedPatient.value) return
  const p = selectedPatient.value
  const d = doctorInfo.value || {}
  const title = workspaceMode.value === 'diagnosis' ? 'التشخيص' : 'Rx/'
  const content = workspaceContent.value
  const dateStr = new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' })
  const e = escapeHtml
  const win = window.open('', '_blank', 'width=794,height=1123')
  win.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><title>${e(title)}</title><style>
    *{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl}
    .a5-sheet{width:148mm;min-height:210mm;padding:15mm;margin:0 auto;background:white;display:flex;flex-direction:column;gap:18px}
    .a5-header{text-align:center;padding-bottom:14px;border-bottom:2.5px solid #1a5276}
    .a5-clinic-name{font-size:22px;font-weight:900;color:#1a5276;display:block;margin-bottom:5px}
    .a5-doctor-bio{font-size:12px;font-weight:700;color:#666;display:block;margin-top:5px}
    .a5-patient-row{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
    .a5-patient-field{display:flex;flex-direction:column;gap:4px;align-items:center;flex:1}
    .a5-field-label{font-size:12px;font-weight:800;color:#888}
    .a5-field-value{font-size:15px;font-weight:800;color:#333}
    .a5-rx{flex:1;display:flex;flex-direction:column;gap:10px}
    .a5-rx-label{font-size:20px;font-weight:900;color:#1a5276;font-style:italic}
    .a5-rx-content{flex:1;min-height:260px;font-size:15px;line-height:1.8;color:#333;white-space:pre-wrap;word-wrap:break-word;padding:10px}
    .a5-footer{display:flex;justify-content:space-between;align-items:center;gap:10px;padding-top:12px;border-top:2.5px solid #000;margin-top:auto}
    .a5-footer-text{font-size:12.5px;font-weight:700;color:#666}
    @media print{body{margin:0}.a5-sheet{margin:0;padding:15mm;min-height:auto;height:auto}}
  </style></head><body>
    <div class="a5-sheet">
      <div class="a5-header">
        <span class="a5-clinic-name">${e(d.clinic_name || doctorDisplayName.value || 'عيادتي')}</span>
        ${d.doctor_name && d.doctor_name !== d.clinic_name ? '<span class="a5-doctor-name">' + e(d.doctor_name) + '</span>' : ''}
        ${d.doctor_bio ? '<span class="a5-doctor-bio">' + e(d.doctor_bio) + '</span>' : ''}
      </div>
      <div class="a5-patient-row">
        <div class="a5-patient-field"><span class="a5-field-label">اسم المريض</span><span class="a5-field-value">${e(p.full_name || '')}</span></div>
        <div class="a5-patient-field"><span class="a5-field-label">العمر</span><span class="a5-field-value">${e(String(p.age || 'غير محدد'))}</span></div>
        <div class="a5-patient-field"><span class="a5-field-label">التاريخ</span><span class="a5-field-value">${e(dateStr)}</span></div>
      </div>
      <div class="a5-rx">
        <span class="a5-rx-label">${e(title)}</span>
        <div class="a5-rx-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>
      </div>
      <div class="a5-footer">
        <span class="a5-footer-text">${e(d.clinic_address || '')}</span>
        <span class="a5-footer-text">${e(d.phone1 || '')}</span>
      </div>
    </div>
    <script>setTimeout(function(){window.print();window.close()},600)<\/script>
  </body></html>`)
  win.document.close()
}

async function savePatient() {
  if (!newPatient.value.full_name.trim()) return
  savingPatient.value = true
  try {
    const created = await patientsRepo.create(clinicId.value, { ...newPatient.value })
    auditLogsRepo.log(clinicId.value, 'create', 'إضافة مريض جديد: ' + newPatient.value.full_name).catch(() => {})
    showToast('تم إضافة المريض بنجاح')
    showAddModal.value = false
    newPatient.value = { full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' }
    selectPatient(created)
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
  finally { savingPatient.value = false }
}

const todayQueue = ref([])
const todayKey = computed(() => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}` })
const prevStatuses = ref({})
const autoOpenedAppointmentId = ref(null)
const auditLogs = ref([])
const showBackupModal = ref(false)
const backingUp = ref(false)
const backupData = ref(null)
const reportTab = ref('summary')

const fullFileDocs = ref([])
const showDocViewer = ref(false)
const viewingDoc = ref(null)
const showAddDocModal = ref(false)
const newDocTitle = ref('')
const newDocDesc = ref('')
const newDocFile = ref(null)
const newDocPreview = ref('')
const uploadingDoc = ref(false)

let audioCtx = null
function getAudioContext() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

function playArrivalSound() {
  try {
    const ctx = getAudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.type = 'sine'
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    o.frequency.setValueAtTime(880, ctx.currentTime + 0.2)
    g.gain.setValueAtTime(0.4, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.5)
    const o2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    o2.connect(g2); g2.connect(ctx.destination)
    o2.type = 'sine'
    o2.frequency.setValueAtTime(1100, ctx.currentTime + 0.15)
    o2.frequency.setValueAtTime(1320, ctx.currentTime + 0.25)
    o2.frequency.setValueAtTime(1100, ctx.currentTime + 0.35)
    g2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
    g2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.55)
    o2.start(ctx.currentTime + 0.15); o2.stop(ctx.currentTime + 0.55)
  } catch (e) {}
}

async function loadAuditLogs() {
  if (!clinicId.value) return
  try { auditLogs.value = await auditLogsRepo.list(clinicId.value, 20) } catch (e) {}
}

async function runBackup() {
  if (!clinicId.value) return
  backingUp.value = true
  try {
    backupData.value = await backupRepo.exportAll(clinicId.value)
    showToast('تم تصدير البيانات بنجاح — يمكنك تحميل ملف JSON')
  } catch (e) { showToast('خطأ في النسخ الاحتياطي', 'error') }
  backingUp.value = false
}

function downloadBackup() {
  if (!backupData.value) return
  const blob = new Blob([JSON.stringify(backupData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `madar-backup-${clinicId.value}-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('تم تحميل ملف النسخ الاحتياطي')
}

function viewDocument(doc) { viewingDoc.value = doc; showDocViewer.value = true }

function uploadDocument(e) {
  const file = e.target.files[0]
  if (!file || !fullFilePatient.value) return
  newDocFile.value = file
  newDocTitle.value = file.name.replace(/\.[^/.]+$/, '')
  const reader = new FileReader()
  reader.onload = (ev) => { newDocPreview.value = ev.target.result }
  reader.readAsDataURL(file)
  showAddDocModal.value = true
}

function onDocFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  newDocFile.value = file
  if (!newDocTitle.value) newDocTitle.value = file.name.replace(/\.[^/.]+$/, '')
  const reader = new FileReader()
  reader.onload = (ev) => { newDocPreview.value = ev.target.result }
  reader.readAsDataURL(file)
}

async function confirmAddDocument() {
  if (!newDocFile.value || !fullFilePatient.value) return
  uploadingDoc.value = true
  try {
    const formData = new FormData()
    formData.append('image', newDocFile.value)
    const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY
    let fileUrl = ''
    if (imgbbKey) {
      const res = await fetch('https://api.imgbb.com/1/upload?key=' + imgbbKey, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) fileUrl = data.data.url
    }
    await patientDocsRepo.add(clinicId.value, fullFilePatient.value.id, {
      title: newDocTitle.value || 'مستند',
      description: newDocDesc.value || '',
      file_url: fileUrl,
      file_type: newDocFile.value.type?.startsWith('image') ? 'image' : 'document'
    })
    fullFileDocs.value = await patientDocsRepo.list(clinicId.value, fullFilePatient.value.id)
    showToast('تم إضافة المستند')
    showAddDocModal.value = false
    newDocFile.value = null
    newDocTitle.value = ''
    newDocDesc.value = ''
    newDocPreview.value = ''
  } catch (e) { showToast('خطأ في رفع المستند', 'error') }
  uploadingDoc.value = false
}

async function deleteDocument(docId) {
  if (!fullFilePatient.value) return
  try {
    await patientDocsRepo.remove(docId)
    fullFileDocs.value = fullFileDocs.value.filter(d => d.id !== docId)
    showToast('تم حذف المستند')
  } catch (e) { showToast('خطأ', 'error') }
}

let unsubs = []
onMounted(async () => {
  timerInterval = setInterval(() => { now.value = Date.now() }, 60000)
  if (!clinicId.value) return
  const cid = clinicId.value

  const clinicSnap = await getDocs(query(collection(db, 'clinics'), where('__name__', '==', cid), limit(1)))
  if (!clinicSnap.empty) { clinicName.value = clinicSnap.docs[0].data().name || '' }

  const dsSnap = await getDocs(query(collection(db, 'doctor_settings'), where('clinicId', '==', cid), limit(1)))
  if (!dsSnap.empty) {
    const dsData = dsSnap.docs[0].data()
    doctorPhoto.value = dsData.photoUrl || ''
    doctorInfo.value = dsData
  }

  const subs = [
    onSnapshot(query(collection(db, 'patients'), where('clinicId', '==', cid)), snap => { patients.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) }),
    onSnapshot(query(collection(db, 'prescriptions'), where('clinicId', '==', cid)), snap => { prescriptions.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) }),
    onSnapshot(query(collection(db, 'appointments'), where('clinicId', '==', cid), where('appointment_date', '==', todayKey)), async (snap) => {
      const allList = snap.docs.map(d => {
        const a = d.data()
        const status = a.status || (a.entered === 1 ? 'arrived' : a.missed === 1 ? 'missed' : 'booked')
        return {
          id: d.id, ...a,
          full_name: a.full_name || '---',
          phone: a.phone || '',
          patient_id: a.patient_id || a.patientId || null,
          is_new_patient: a.is_new_patient ?? false,
          status
        }
      })

      allTodayAppointments.value = allList

      const list = allList
        .filter(a => ['arrived', 'consulting', 'booked'].includes(a.status))
        .sort((a, b) => {
          const order = { arrived: 0, consulting: 1, booked: 2 }
          return (order[a.status] || 0) - (order[b.status] || 0)
        })

      for (const a of list) {
        const prev = prevStatuses.value[a.id]
        const isArrivedNow = a.status === 'arrived'
        const wasNotArrived = prev === undefined || (prev && prev !== 'arrived')
        if (isArrivedNow && wasNotArrived) {
          if (prev !== undefined) {
            playArrivalSound()
            showToast('🟢 دخل المريض: ' + a.full_name, 'success')
          }
          const pid = a.patient_id || a.patientId
          if (pid && !selectedPatient.value) {
            autoOpenedAppointmentId.value = a.id
            let patientData = { id: pid, full_name: a.full_name, phone: a.phone, age: a.age }
            try {
              const pSnap = await getDoc(doc(db, 'patients', pid))
              if (pSnap.exists()) patientData = { id: pSnap.id, ...pSnap.data() }
            } catch (e) {}
            selectedPatient.value = patientData
            workspaceMode.value = null
            workspaceContent.value = ''
            fullFileMode.value = false
            addToRecentViewed(selectedPatient.value)
          }
        }
        prevStatuses.value[a.id] = a.status
      }

      todayQueue.value = list
    }),
    onSnapshot(query(collection(db, 'notifications'), where('clinicId', '==', cid), limit(50)), (snap) => {
      const uid = authStore.uid
      notifications.value = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(n => (n.toUserId === uid || n.toUserId === 'all') && n.type !== 'message')
      unreadNotifCount.value = notifications.value.filter(n => !n.read).length
    }),
  ]
  unsubs = subs
  loadAuditLogs()
  document.addEventListener('click', closeOptions)
  document.addEventListener('click', () => { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume() }, { once: true })
})

onUnmounted(() => { unsubs.forEach(u => { if (typeof u === 'function') u() }); clearTimeout(searchTimeout); document.removeEventListener('click', closeOptions); if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.dash { padding: 28px 32px; max-width: 1400px; margin: 0 auto; background: #F5F5F7; min-height: 100vh; }

/* ============ DOCTOR TAB BAR ============ */
.doc-tab-bar { display: flex; gap: 8px; margin-bottom: 16px; }
.doc-tab { display: inline-flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 10px; border: 1px solid #e5e7eb; background: #fff; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; font-family: inherit; }
.doc-tab:hover { background: #f8fafc; color: #1e293b; }
.doc-tab.active { background: #1150c9; color: #fff; border-color: #1150c9; }
.archive-date-input { padding: 8px 14px; border-radius: 10px; border: 1px solid #e5e7eb; font-size: 0.85rem; font-family: inherit; color: #1e293b; background: #fff; cursor: pointer; }
.slot-time-badge { display: inline-block; padding: 3px 10px; border-radius: 8px; background: #eff6ff; color: #1150c9; font-size: 0.78rem; font-weight: 700; }
.qt-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
.badge-booked { background: #eff6ff; color: #21A8E0; }
.badge-arrived { background: #ecfdf5; color: #059669; }
.badge-completed { background: #f3e8ff; color: #8b5cf6; }
.badge-missed { background: #fef2f2; color: #ef4444; }
.pay-badge { display: inline-block; padding: 3px 10px; border-radius: 8px; font-size: 0.72rem; font-weight: 700; }
.pay-paid { background: #ecfdf5; color: #059669; }
.pay-unpaid { background: #f1f5f9; color: #94a3b8; }

/* ============ HEADER ============ */
.dash-header { display: flex; align-items: center; gap: 20px; margin-bottom: 28px; }
.dh-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.dh-circle-btn {
  width: 44px; height: 44px; border-radius: 50%; background: #fff; border: none;
  display: grid; place-items: center; color: #64748b; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06); transition: all 0.2s; position: relative;
}
.dh-circle-btn:hover { color: #21A8E0; box-shadow: 0 4px 12px rgba(33,168,224,0.15); }
.dh-circle-btn.active { color: #21A8E0; background: #eff6ff; }
.dh-circle-btn.has-notifs { color: #ef4444; }
.notif-badge {
  position: absolute; top: -2px; right: -2px; min-width: 18px; height: 18px;
  padding: 0 5px; border-radius: 9px; background: #ef4444; color: #fff;
  font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center;
  border: 2px solid #fff; animation: badgePop 0.3s ease;
}
@keyframes badgePop { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }

/* Notification Dropdown */
.nd-overlay { position: fixed; inset: 0; z-index: 999; background: transparent; }
.notif-dropdown {
  position: fixed; width: 360px; max-width: calc(100vw - 24px);
  background: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.12); z-index: 1000; max-height: 70vh; overflow-y: auto;
}
.nd-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
.nd-header h3 { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin: 0; }
.nd-mark-all { background: none; border: none; color: #21A8E0; font-size: 0.72rem; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 6px; }
.nd-mark-all:hover { background: #eff6ff; }
.nd-list { }
.nd-item { display: flex; align-items: flex-start; gap: 10px; padding: 12px 18px; cursor: pointer; transition: background 0.15s; border-bottom: 1px solid #f8fafc; }
.nd-item:last-child { border-bottom: none; }
.nd-item:hover { background: #f8fafc; }
.nd-item.unread { background: rgba(33,168,224,0.03); }
.nd-icon { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
.nd-icon.message { background: rgba(33,168,224,0.1); color: #21A8E0; }
.nd-icon.info { background: rgba(245,158,11,0.1); color: #f59e0b; }
.nd-content { flex: 1; min-width: 0; }
.nd-title { display: block; font-size: 0.82rem; font-weight: 700; color: #1e293b; margin-bottom: 2px; }
.nd-source { display: inline-block; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; margin-bottom: 2px; background: rgba(33,168,224,0.08); color: #21A8E0; }
.nd-source.sec { background: rgba(16,185,129,0.08); color: #0d9488; }
.nd-msg { display: block; font-size: 0.75rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nd-time { display: block; font-size: 0.68rem; color: #94a3b8; margin-top: 3px; }
.nd-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 32px 16px; color: #94a3b8; }
.nd-empty p { font-size: 0.82rem; margin: 0; }
.nd-footer { padding: 10px 18px; border-top: 1px solid #f1f5f9; text-align: center; }
.nd-footer button { background: none; border: none; color: #21A8E0; font-size: 0.78rem; font-weight: 600; cursor: pointer; padding: 4px 12px; border-radius: 8px; }
.nd-footer button:hover { background: #eff6ff; }
.dropdown-enter-active { transition: all 0.2s ease; }
.dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px) scale(0.96); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px) scale(0.98); }

/* Search */
.dh-search { flex: 1; display: flex; align-items: center; gap: 12px; padding: 12px 20px; background: #fff; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: box-shadow 0.2s; }
.dh-search:focus-within { box-shadow: 0 0 0 3px rgba(33,168,224,0.15), 0 2px 8px rgba(0,0,0,0.05); }
.dh-search-icon { color: #21A8E0; flex-shrink: 0; }
.dh-search input { flex: 1; border: none; outline: none; font-size: 0.9rem; color: #1e293b; background: transparent; font-family: inherit; }
.dh-search input::placeholder { color: #94a3b8; }
.dh-search-clear { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; display: grid; place-items: center; }
.dh-search-clear:hover { background: #f1f5f9; color: #ef4444; }

/* Profile */
.dh-profile { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.dh-info { text-align: left; }
.dh-info h1 { font-size: 1.05rem; font-weight: 800; color: #1e293b; margin: 0; }
.dh-title { font-size: 0.78rem; color: #94a3b8; font-weight: 500; }
.dh-dots { display: flex; flex-direction: column; gap: 6px; }
.dot { width: 12px; height: 12px; border-radius: 50%; }
.dot-pink { background: #D81B8A; }
.dot-yellow { background: #f59e0b; }
.dh-avatar {
  width: 52px; height: 52px; border-radius: 50%; overflow: hidden;
  background: linear-gradient(135deg, #21A8E0, #0d9488);
  display: grid; place-items: center; flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(33,168,224,0.25);
}
.dh-avatar img { width: 100%; height: 100%; object-fit: cover; }
.dh-avatar span { color: #fff; font-size: 1rem; font-weight: 800; }

/* ============ STATS ============ */
.dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 28px; }
.stat-card {
  background: #fff; border-radius: 20px; padding: 22px 24px;
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
.stat-body { flex: 1; }
.stat-val { display: block; font-size: 1.5rem; font-weight: 800; color: #1e293b; line-height: 1.2; }
.stat-val small { font-size: 0.7rem; font-weight: 600; color: #94a3b8; }
.stat-label { display: block; font-size: 0.75rem; color: #94a3b8; margin-top: 4px; font-weight: 500; }
.stat-icon { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; }
.si-purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.si-yellow { background: rgba(245,158,11,0.1); color: #f59e0b; }
.si-pink { background: rgba(216,27,138,0.1); color: #D81B8A; }
.si-blue { background: rgba(33,168,224,0.1); color: #21A8E0; }

/* ============ MAIN BODY ============ */
.dash-body { display: flex; gap: 24px; }

/* ============ QUEUE PANEL ============ */
.queue-panel { flex: 1; background: #fff; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); overflow: hidden; }
.qp-header { padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.qp-header h2 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.qp-live { color: #21A8E0; font-weight: 600; }
.qp-content { padding: 0; }
.qp-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px 24px; color: #94a3b8; }
.qp-empty p { font-size: 0.88rem; margin: 0; }

.qp-table-header {
  display: flex; align-items: center; padding: 12px 24px; background: #f8fafc;
  font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
}
.qp-col { }
.qp-col-patient { flex: 2.5; display: flex; align-items: center; gap: 12px; }
.qp-col-turn { flex: 0.8; text-align: center; }
.qp-col-time { flex: 1.2; }
.qp-col-status { flex: 1; }
.qp-col-actions { flex: 0.8; display: flex; gap: 6px; justify-content: center; }

.qp-row {
  display: flex; align-items: center; padding: 14px 24px;
  border-bottom: 1px solid #f8fafc; transition: background 0.15s;
}
.qp-row:last-child { border-bottom: none; }
.qp-row:hover { background: #f8fafc; }

.qp-avatar { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; font-size: 0.7rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.qp-patient-info { display: flex; flex-direction: column; }
.qp-name { font-size: 0.88rem; font-weight: 600; color: #1e293b; }
.qp-phone { font-size: 0.72rem; color: #94a3b8; }
.qp-turn-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 10px; background: #f1f5f9;
  font-size: 0.82rem; font-weight: 700; color: #64748b;
}
.qp-time-badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: 999px; background: #f1f5f9; font-size: 0.78rem; font-weight: 600; color: #64748b; }
.qp-countdown-badge { display: inline-flex; align-items: center; justify-content: center; padding: 4px 12px; border-radius: 999px; background: #f0fdf4; font-size: 0.72rem; font-weight: 600; color: #15803d; }
.qp-col-countdown { min-width: 110px; }
.qp-status {
  display: inline-block; font-size: 0.72rem; font-weight: 700; padding: 4px 14px; border-radius: 999px;
}
.s-booked { background: #e0f2fe; color: #0369a1; }
.s-arrived { background: #fef3c7; color: #92400e; }
.s-consulting { background: #ede9fe; color: #6d28d9; }
.s-completed { background: #dcfce7; color: #15803d; }
.s-missed { background: #fef2f2; color: #dc2626; }

.qp-row.status-completed { opacity: 0.7; }
.qp-row.status-missed { opacity: 0.5; }

.qp-action-btn {
  width: 34px; height: 34px; border-radius: 50%; background: #f8fafc; border: 1px solid #e5e7eb;
  display: grid; place-items: center; cursor: pointer; color: #64748b; transition: all 0.2s;
}
.qp-action-btn:hover { background: #eff6ff; border-color: #21A8E0; color: #21A8E0; }
.qp-options-wrap { position: relative; }
.qp-options-dropdown {
  position: absolute; top: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: #fff; border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  padding: 6px; z-index: 50; min-width: 160px; white-space: nowrap;
}
.qp-options-dropdown button {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 12px;
  background: none; border: none; border-radius: 8px; font-size: 0.78rem;
  font-weight: 600; color: #475569; cursor: pointer; font-family: inherit; text-align: right;
}
.qp-options-dropdown button:hover { background: #f1f5f9; color: #1e293b; }

/* ============ SIDE PANEL ============ */
.side-panel { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; }
.sp-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 16px 20px; border-radius: 16px; border: none; cursor: pointer;
  font-size: 0.9rem; font-weight: 700; color: #fff; font-family: inherit;
  transition: all 0.25s; box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}
.sp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.sp-blue { background: linear-gradient(135deg, #21A8E0, #0ea5e9); }
.sp-blue:hover { box-shadow: 0 8px 24px rgba(33,168,224,0.35); }
.sp-pink { background: linear-gradient(135deg, #D81B8A, #be185d); }
.sp-pink:hover { box-shadow: 0 8px 24px rgba(216,27,138,0.35); }

.recent-card {
  background: #fff; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  padding: 20px; flex: 1; overflow-y: auto;
}
.recent-card h3 { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0 0 16px; }
.rc-empty { text-align: center; padding: 24px 0; color: #94a3b8; }
.rc-empty p { font-size: 0.78rem; margin: 0; }
.rc-list { display: flex; flex-direction: column; gap: 8px; }
.rc-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: #f8fafc; border-radius: 12px; cursor: pointer; transition: all 0.2s;
}
.rc-item:hover { background: #f1f5f9; transform: translateX(-4px); }
.rc-avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.rc-info { flex: 1; min-width: 0; }
.rc-name { display: block; font-size: 0.82rem; font-weight: 600; color: #1e293b; }
.rc-file { display: block; font-size: 0.7rem; color: #94a3b8; margin-top: 1px; }
.rc-time { display: block; font-size: 0.68rem; color: #cbd5e1; margin-top: 1px; }
.rc-meta { display: block; font-size: 0.75rem; color: #64748b; margin-top: 2px; }

/* ============ SEARCH RESULTS ============ */
.search-results { animation: fadeUp 0.25s ease; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 24px; gap: 14px; color: #94a3b8; }
.spinner { width: 36px; height: 36px; border: 3px solid #e5e7eb; border-top-color: #21A8E0; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.results-list { display: flex; flex-direction: column; gap: 8px; }
.result-card { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: #fff; border-radius: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.result-card:hover { box-shadow: 0 4px 16px rgba(33,168,224,0.12); }
.rc-actions { display: flex; gap: 6px; flex-shrink: 0; }
.rc-btn { width: 36px; height: 36px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; display: grid; place-items: center; cursor: pointer; transition: all 0.2s; }
.rc-btn-diag { color: #21A8E0; }
.rc-btn-diag:hover { background: #eff6ff; border-color: #21A8E0; }
.rc-btn-rx { color: #D81B8A; }
.rc-btn-rx:hover { background: #fdf2f8; border-color: #D81B8A; }

/* ============ PROFILE ============ */
@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.profile-section { animation: fadeUp 0.25s ease; }
.profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.back-btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; display: grid; place-items: center; cursor: pointer; color: #64748b; flex-shrink: 0; transition: all 0.2s; }
.back-btn:hover { background: #eff6ff; color: #21A8E0; border-color: #21A8E0; }
.auto-open-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 999px;
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #15803d; font-size: 0.75rem; font-weight: 700;
  animation: badgePulse 2s ease-in-out infinite;
}
@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
}
.toast.success.arrival { background: linear-gradient(135deg, #059669, #047857); }
.ph-avatar { width: 56px; height: 56px; border-radius: 50%; display: grid; place-items: center; font-size: 1.1rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.ph-info h2 { font-size: 1.3rem; font-weight: 800; color: #1e293b; margin: 0; }
.ph-info p { font-size: 0.82rem; color: #64748b; margin: 4px 0 0; }

.profile-info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; margin-bottom: 24px; }
.info-chip { padding: 12px 16px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.ic-label { display: block; font-size: 0.68rem; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
.ic-value { display: block; font-size: 0.85rem; color: #1e293b; font-weight: 600; }

.patient-actions { margin-bottom: 24px; }
.section-title { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin-bottom: 14px; }
.pa-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pa-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 22px 12px; background: #fff; border: 2px solid #f1f5f9; border-radius: 16px; cursor: pointer; transition: all 0.25s; }
.pa-card:hover { transform: translateY(-3px); box-shadow: 0 6px 24px rgba(0,0,0,0.07); }
.pa-blue { color: #21A8E0; }
.pa-blue:hover { border-color: #21A8E0; background: #eff6ff; }
.pa-pink { color: #D81B8A; }
.pa-pink:hover { border-color: #D81B8A; background: #fdf2f8; }
.pa-purple { color: #8b5cf6; }
.pa-purple:hover { border-color: #8b5cf6; background: #f5f3ff; }
.pa-card span { font-size: 0.82rem; font-weight: 700; }

/* ============ WORKSPACE (A5 Sheet — same as MedicalRecord) ============ */
.workspace-section { animation: fadeUp 0.25s ease; }
.ws-toolbar { display: flex; align-items: center; gap: 12px; padding: 16px 0; margin-bottom: 12px; flex-wrap: wrap; }
.ws-toolbar-title { flex: 1; }
.ws-toolbar-title h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
.ws-toolbar-actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ============ PATIENT ACTIONS — GOLD ============ */
.pa-gold { color: #d69e1f; }
.pa-gold:hover { border-color: #d69e1f; background: #fffbeb; }
.pa-green { color: #059669; }
.pa-green:hover { border-color: #059669; background: #ecfdf5; }

/* ============ PRINT PREVIEW MODAL ============ */
.print-modal { width: 90%; max-width: 600px; max-height: 85vh; background: #fff; border-radius: 16px; box-shadow: 0 24px 64px rgba(0,0,0,0.18); display: flex; flex-direction: column; overflow: hidden; animation: modalIn 0.25s ease; }
.pm-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.pm-header h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
.pm-actions { display: flex; gap: 8px; align-items: center; }
.pm-print-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 8px; border: none; background: linear-gradient(135deg, #21A8E0, #0ea5e9);
  color: #fff; font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: inherit;
  transition: all 0.2s;
}
.pm-print-btn:hover { box-shadow: 0 4px 16px rgba(33,168,224,0.3); }
.pm-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem; padding: 4px; }
.pm-close:hover { color: #ef4444; }
.pm-body { padding: 24px; overflow-y: auto; flex: 1; background: #f8fafc; }

.print-doc { background: #fff; padding: 28px 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
.pd-header { text-align: center; padding-bottom: 14px; border-bottom: 3px solid #1150c9; margin-bottom: 18px; }
.pd-clinic-name { font-size: 1.3rem; font-weight: 800; color: #1150c9; }
.pd-title { font-size: 0.88rem; color: #64748b; margin-top: 4px; }
.rx-header { border-bottom-color: #D81B8A; }
.rx-header .pd-clinic-name { color: #D81B8A; }
.pd-patient-row { display: flex; gap: 20px; font-size: 0.85rem; color: #475569; margin-bottom: 14px; flex-wrap: wrap; }
.pd-divider { height: 1px; background: #e5e7eb; margin-bottom: 18px; }
.rx-divider { background: #fce7f3; }
.pd-content { font-size: 0.9rem; line-height: 1.9; color: #1e293b; min-height: 100px; }
.pd-content .rx-item { padding: 4px 0; border-bottom: 1px dashed #f1f5f9; }
.pd-footer { margin-top: 32px; text-align: left; }
.pd-signature { font-size: 0.88rem; font-weight: 700; color: #1150c9; border-top: 2px solid #e5e7eb; padding-top: 10px; display: inline-block; }

/* ============ FULL PATIENT FILE ============ */
.full-file-section { animation: fadeUp 0.3s ease; }
.ff-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
.ff-header h2 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0; }
.back-btn { width: 40px; height: 40px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; display: grid; place-items: center; cursor: pointer; color: #64748b; flex-shrink: 0; transition: all 0.2s; }
.back-btn:hover { background: #eff6ff; color: #21A8E0; border-color: #21A8E0; }

.ff-patient-card {
  display: flex; align-items: center; gap: 20px; padding: 24px;
  background: #fff; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  margin-bottom: 24px;
}
.ffc-avatar { width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; font-size: 1.3rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.ffc-info h3 { font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0 0 10px; }
.ffc-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
.ffc-chips span { padding: 5px 12px; border-radius: 999px; background: #f1f5f9; font-size: 0.75rem; font-weight: 600; color: #475569; }
.chronic-tag { background: #fef3c7 !important; color: #92400e !important; }

.ff-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; color: #94a3b8; }
.ff-loading p { font-size: 0.88rem; margin: 0; }

.ff-section-title { font-size: 1rem; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
.ff-count { font-size: 0.78rem; font-weight: 500; color: #94a3b8; }

.ff-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 50px; color: #94a3b8; }
.ff-empty p { font-size: 0.88rem; margin: 0; }

.tl-list { position: relative; }
.tl-card { display: flex; gap: 16px; margin-bottom: 8px; position: relative; }
.tl-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; z-index: 2; border: 3px solid #fff; box-shadow: 0 0 0 2px #e5e7eb; }
.tl-dot.tl-booked { background: #0369a1; box-shadow: 0 0 0 2px #0369a1; }
.tl-dot.tl-consulting { background: #d69e1f; box-shadow: 0 0 0 2px #d69e1f; }
.tl-dot.tl-completed { background: #059669; box-shadow: 0 0 0 2px #059669; }
.tl-dot.tl-missed { background: #dc2626; box-shadow: 0 0 0 2px #dc2626; }
.tl-line { position: absolute; right: 6px; top: 18px; bottom: -8px; width: 2px; background: #e5e7eb; z-index: 1; }
.tl-card:last-child .tl-line { display: none; }
.tl-body {
  flex: 1; background: #fff; border-radius: 14px; padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: box-shadow 0.2s;
}
.tl-body:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.tl-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.tl-date { font-size: 0.88rem; font-weight: 700; color: #1e293b; }
.tl-status { font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
.tls-booked { background: #e0f2fe; color: #0369a1; }
.tls-consulting { background: #fef3c7; color: #92400e; }
.tls-completed { background: #dcfce7; color: #15803d; }
.tls-missed { background: #fef2f2; color: #dc2626; }
.tls-entry { background: #ede9fe; color: #6d28d9; }

.tl-section { margin-bottom: 8px; }
.tls-label {
  display: inline-flex; align-items: center; gap: 5px; font-size: 0.75rem; font-weight: 700;
  color: #21A8E0; cursor: pointer; padding: 4px 10px; border-radius: 6px;
  transition: all 0.15s;
}
.tls-label:hover { background: rgba(33,168,224,0.08); }
.tls-label.rx { color: #D81B8A; }
.tls-label.rx:hover { background: rgba(216,27,138,0.08); }
.tls-label.notes { color: #64748b; cursor: default; }
.tls-preview { font-size: 0.8rem; color: #64748b; line-height: 1.5; margin-top: 4px; padding-right: 8px; border-right: 2px solid #e5e7eb; }
.tl-notes { font-size: 0.82rem; color: #64748b; line-height: 1.5; }
.tl-fee { font-size: 0.78rem; font-weight: 700; color: #059669; margin-top: 6px; }

/* ============ MODAL ============ */
.modal { width: 90%; max-width: 680px; max-height: 90vh; background: #fff; border-radius: 20px; box-shadow: 0 24px 64px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; animation: modalIn 0.25s ease; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { font-size: 1.05rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field-full { grid-column: 1 / -1; }
.form-field label { font-size: 0.78rem; font-weight: 600; color: #64748b; }
.form-field label em { color: #ef4444; font-style: normal; }
.form-field input, .form-field select, .form-field textarea { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; color: #1e293b; background: #fff; outline: none; transition: border-color 0.2s; font-family: inherit; }
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #21A8E0; }
.icon-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 8px; display: grid; place-items: center; }
.icon-btn:hover { background: #f1f5f9; color: #ef4444; }

/* ============ SHARED ============ */
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; }
.btn-primary { background: linear-gradient(135deg, #21A8E0, #0ea5e9); color: #fff; }
.btn-primary:hover { box-shadow: 0 4px 16px rgba(33,168,224,0.3); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-ghost { background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }

@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

/* ============ AUDIT LOG ============ */
.audit-card {
  background: #fff; border-radius: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
  padding: 20px; overflow: hidden;
}
.audit-card h3 {
  font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0 0 14px;
  display: flex; align-items: center; gap: 8px;
}
.audit-list { display: flex; flex-direction: column; gap: 10px; max-height: 300px; overflow-y: auto; }
.audit-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 10px; background: #f8fafc; border-radius: 10px; }
.audit-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
.audit-create { background: #10b981; }
.audit-update { background: #21A8E0; }
.audit-delete { background: #ef4444; }
.audit-info { flex: 1; min-width: 0; }
.audit-action { display: block; font-size: 0.78rem; font-weight: 600; color: #1e293b; }
.audit-meta { display: block; font-size: 0.68rem; color: #94a3b8; margin-top: 2px; }

/* ============ GOLD BUTTON ============ */
.sp-gold { background: linear-gradient(135deg, #d69e1f, #b45309); }
.sp-gold:hover { box-shadow: 0 8px 24px rgba(214,158,31,0.35); }

/* ============ DOCUMENTS ============ */
.docs-section { margin-top: 28px; }
.docs-section .ff-section-title { margin-bottom: 16px; }
.doc-upload-btn {
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px;
  border-radius: 10px; background: linear-gradient(135deg, #21A8E0, #0ea5e9);
  color: #fff; font-size: 0.78rem; font-weight: 700; cursor: pointer;
  transition: all 0.2s; font-family: inherit;
}
.doc-upload-btn:hover { box-shadow: 0 4px 12px rgba(33,168,224,0.3); }
.docs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.doc-card {
  background: #fff; border-radius: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden; cursor: pointer; transition: all 0.2s; position: relative;
}
.doc-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
.doc-thumb { width: 100%; height: 130px; background: #f8fafc; display: grid; place-items: center; overflow: hidden; }
.doc-thumb img { width: 100%; height: 100%; object-fit: cover; }
.doc-info { padding: 10px 14px; }
.doc-title { display: block; font-size: 0.78rem; font-weight: 600; color: #1e293b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.doc-date { display: block; font-size: 0.68rem; color: #94a3b8; margin-top: 2px; }
.doc-delete {
  position: absolute; top: 8px; left: 8px; width: 28px; height: 28px;
  border-radius: 50%; background: rgba(0,0,0,0.5); border: none;
  display: grid; place-items: center; color: #fff; cursor: pointer;
  opacity: 0; transition: opacity 0.2s;
}
.doc-card:hover .doc-delete { opacity: 1; }
.doc-delete:hover { background: #ef4444; }

/* ============ RESPONSIVE ============ */
@media (max-width: 1024px) {
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
  .dash-body { flex-direction: column; }
  .side-panel { width: 100%; flex-direction: row; flex-wrap: wrap; }
  .side-panel .sp-btn { flex: 1; min-width: 200px; }
  .recent-card { width: 100%; }
}
@media (max-width: 768px) {
  .dash { padding: 16px; }
  .dash-header { flex-wrap: wrap; gap: 12px; }
  .dh-search { order: 10; width: 100%; }
  .dh-profile { order: 1; }
  .dh-actions { order: 2; margin-right: auto; }
  .dh-info h1 { font-size: 0.9rem; }
  .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .stat-card { padding: 16px; }
  .stat-val { font-size: 1.2rem; }
  .stat-icon { width: 42px; height: 42px; }
  .qp-table-header { display: none; }
  .qp-row { flex-wrap: wrap; gap: 8px; padding: 14px 16px; border-radius: 12px; margin: 0 12px 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  .qp-col-patient { flex-basis: 100%; }
  .qp-col-turn { flex-basis: auto; }
  .qp-col-time { flex-basis: auto; }
  .qp-col-status { flex-basis: auto; }
  .qp-col-actions { flex-basis: auto; margin-right: auto; }
  .side-panel { flex-direction: column; }
  .side-panel .sp-btn { min-width: unset; }
  .notif-dropdown { width: calc(100vw - 24px); left: auto; right: -8px; max-width: 360px; }
  .modal { width: 95%; }
  .print-modal { width: 95%; max-width: none; }
  .form-grid { grid-template-columns: 1fr; gap: 12px; }
  .modal-header { padding: 16px 18px; }
  .modal-body { padding: 16px 18px; }
  .modal-footer { padding: 12px 18px; }
  .pa-grid { grid-template-columns: repeat(3, 1fr); }
  .ff-patient-card { flex-direction: column; text-align: center; }
  .ffc-chips { justify-content: center; }
  .pd-patient-row { flex-direction: column; gap: 4px; }
  .print-doc { padding: 20px; }
}
</style>
