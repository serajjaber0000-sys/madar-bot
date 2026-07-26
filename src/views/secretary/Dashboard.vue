<template>
  <AppLayout>
    <div class="dash">
      <!-- HEADER -->
      <header class="dash-header">
        <div class="dh-actions">
          <router-link :to="'/clinic/' + clinicId + '/secretary/chats'" class="dh-circle-btn dh-chat-btn" title="محادثة المرضى">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span v-if="unreadChatCount > 0" class="notif-badge chat-badge">{{ unreadChatCount }}</span>
          </router-link>
          <div class="dh-circle-btn" @click.stop="showSettings = !showSettings" title="الإعدادات"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <transition name="dropdown">
              <div v-if="showSettings" class="settings-panel" @click.stop>
                <div class="sp-header"><h3>إعدادات الطابور</h3><button class="sp-close" @click="showSettings = false">✕</button></div>
                <div class="sp-body">
                  <div class="sp-row">
                    <span class="sp-label">وقت الفتح</span>
                    <span class="sp-value">{{ clinicOpenTime || '—' }}</span>
                  </div>
                  <div class="sp-row">
                    <span class="sp-label">وقت الإغلاق</span>
                    <span class="sp-value">{{ clinicCloseTime || '—' }}</span>
                  </div>
                  <div class="sp-row">
                    <span class="sp-label">أتعاب افتراضية</span>
                    <span class="sp-value">{{ defaultConsultationFee ? Number(defaultConsultationFee).toLocaleString() + ' د.ع' : '—' }}</span>
                  </div>
                  <div class="sp-divider"></div>
                  <div class="sp-field">
                    <label>الفترة الزمنية لكل موعد (دقيقة)</label>
                    <div class="sp-input-row">
                      <input v-model.number="slotInterval" type="number" min="5" max="120" step="5" />
                      <button class="sp-save" @click="saveInterval">حفظ</button>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          <div class="dh-circle-btn" ref="bellBtnRef" @click.stop="toggleNotifPanel"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span v-if="unreadNotifCount > 0" class="notif-badge">{{ unreadNotifCount }}</span></div>
        </div>
        <div class="dh-search">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#21A8E0" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
          <input v-model="searchQuery" type="text" placeholder="البحث عن مريض بالاسم أو رقم الهاتف..." @input="onSearch" />
          <button v-if="searchQuery" class="dh-clear" @click="searchQuery = ''; searchResults = []">✕</button>
        </div>
        <div class="dh-profile">
          <div class="dh-dots"><span class="dot dot-pink"></span><span class="dot dot-yellow"></span></div>
          <div class="dh-info"><h1>{{ secretaryName }}</h1><span class="dh-title">سكرتير</span></div>
          <div class="dh-avatar"><span>{{ secretaryInitials }}</span></div>
        </div>
      </header>

      <!-- TELEPORTED NOTIFICATION PANEL -->
      <Teleport to="body">
        <div v-if="showNotifPanel" class="nd-overlay" @click="showNotifPanel = false"></div>
        <transition name="dropdown">
          <div v-if="showNotifPanel" class="notif-dropdown" @click.stop :style="notifDropdownStyle">
            <div class="nd-header">
              <h3>الإشعارات</h3>
              <span v-if="unreadNotifCount > 0" class="nd-unread-text">{{ unreadNotifCount }} جديد</span>
            </div>

            <!-- PENDING BOOKING REQUESTS -->
            <div v-if="pendingBookings.length > 0" class="nd-pending-section">
              <div class="nd-pending-title">طلبات حجز جديدة</div>
              <div v-for="pr in pendingBookings" :key="pr.id" class="nd-booking-card">
                <div class="nd-bc-top">
                  <div class="nd-bc-avatar" :style="{ background: avatarColor(pr.patient_name) }">{{ initials(pr.patient_name) }}</div>
                  <div class="nd-bc-info">
                    <span class="nd-bc-name">{{ pr.patient_name || '---' }}</span>
                    <span v-if="pr.phone" class="nd-bc-phone">{{ pr.phone }}</span>
                  </div>
                </div>
                <div v-if="pr.reason" class="nd-bc-reason">السبب: {{ pr.reason }}</div>
                <div v-if="pr.appointment_date || pr.start_time" class="nd-bc-date">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#64748b" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                  {{ formatArabicDate(pr.appointment_date) }}{{ pr.start_time ? ' — ' + to12h(pr.start_time) : '' }}
                </div>
                <div class="nd-bc-actions">
                  <button class="nd-btn nd-btn-reject" @click="rejectBooking(pr)" :disabled="savingNotif">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    رفض
                  </button>
                  <button class="nd-btn nd-btn-time" @click="openSetTimeModal(pr)">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    تحديد الوقت
                  </button>
                  <button class="nd-btn nd-btn-approve" @click="approveBooking(pr)" :disabled="savingNotif">
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    موافقة
                  </button>
                </div>
              </div>
            </div>

            <div v-if="pendingBookings.length === 0 && notifications.length === 0 && chatNotifications.length === 0" class="nd-empty"><p>لا توجد إشعارات</p></div>
            <div v-else class="nd-list">
              <div v-for="n in chatNotifications" :key="n.id" class="nd-item nd-chat" :class="{ unread: !n.read }" @click="openChatFromNotif(n)">
                <div class="nd-icon nd-icon-chat">💬</div>
                <div class="nd-content">
                  <span class="nd-title">{{ n.title }}</span>
                  <span class="nd-msg">{{ n.message }}</span>
                </div>
              </div>
              <div v-for="n in notifications.slice(0, 8)" :key="n.id" class="nd-item" :class="{ unread: !n.read }">
                <div class="nd-content">
                  <span class="nd-title">{{ n.title || 'إشعار' }}</span>
                  <span class="nd-msg">{{ n.message }}</span>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </Teleport>

      <!-- STATS -->
      <div class="dash-stats">
        <div class="stat-card"><div class="stat-body"><span class="stat-val">{{ todayQueue.length }}</span><span class="stat-label">حجوزات اليوم</span></div><div class="stat-icon si-blue"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></div></div>
        <div class="stat-card"><div class="stat-body"><span class="stat-val">{{ arrivedCount }}</span><span class="stat-label">دخل العيادة</span></div><div class="stat-icon si-green"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
        <div class="stat-card"><div class="stat-body"><span class="stat-val">{{ completedCount }}</span><span class="stat-label">اكتمل</span></div><div class="stat-icon si-purple"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg></div></div>
        <div class="stat-card"><div class="stat-body"><span class="stat-val">{{ todayRevenue.toLocaleString() }} <small>د.ع</small></span><span class="stat-label">إيرادات اليوم</span></div><div class="stat-icon si-gold"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div></div>
      </div>

      <!-- ACTION BUTTONS -->
      <div class="dash-actions">
        <button class="act-btn act-blue" @click="openBookingModal()"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>حجز موعد جديد</button>
        <button class="act-btn act-pink" @click="openAddPatientModal()"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>إضافة مريض جديد</button>
        <button class="act-btn act-gold" @click="currentTab = 'archive'; loadArchive()"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>أرشيف الحجوزات</button>
      </div>

      <!-- SEARCH RESULTS -->
      <div v-if="searchQuery" class="search-section">
        <div v-if="searching" class="empty-box"><div class="spinner"></div></div>
        <div v-else-if="searchResults.length === 0" class="empty-box"><p>لا توجد نتائج</p></div>
        <div v-else class="results-list">
          <div v-for="p in searchResults" :key="p.id" class="result-row" @click="openBookingFor(p)">
            <div class="rr-avatar" :style="{ background: avatarColor(p.full_name) }">{{ initials(p.full_name) }}</div>
            <div class="rr-info"><span class="rr-name">{{ p.full_name }}</span><span class="rr-meta">{{ p.phone || '' }} {{ p.file_number ? '· رقم ' + p.file_number : '' }} {{ p.age ? '· ' + p.age + ' سنة' : '' }}</span></div>
            <div class="rr-actions">
              <button class="rr-book-btn" @click.stop="openBookingFor(p)">حجز</button>
              <button class="rr-edit-btn" @click.stop="openEditPatient(p)" title="تعديل">✏</button>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div v-else class="tab-section">
        <div class="tab-bar">
          <button class="tab-btn" :class="{ active: currentTab === 'queue' }" @click="currentTab = 'queue'">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            طابور اليوم
          </button>
          <button class="tab-btn" :class="{ active: currentTab === 'archive' }" @click="currentTab = 'archive'; loadArchive()">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
            أرشيف الحجوزات
          </button>
        </div>

        <!-- QUEUE TAB -->
        <div v-if="currentTab === 'queue'" class="queue-panel">
          <div class="qp-toolbar">
            <div class="qp-filters">
              <button :class="{ active: queueView === 'active' }" @click="queueView = 'active'">النشطة ({{ activeQueue.length }})</button>
              <button :class="{ active: queueView === 'all' }" @click="queueView = 'all'">الكل ({{ todayQueue.length }})</button>
              <button :class="{ active: queueView === 'archive' }" @click="queueView = 'archive'">الأرشيف ({{ archivedQueue.length }})</button>
            </div>
          </div>
          <div v-if="displayedQueue.length === 0" class="empty-box"><p>{{ queueView === 'active' ? 'لا توجد حجوزات نشطة' : 'لا توجد حجوزات' }}</p></div>
          <div v-else class="queue-table-wrap">
            <table class="queue-table">
              <thead>
                <tr>
                  <th class="qt-num">#</th>
                  <th class="qt-patient">المريض</th>
                  <th class="qt-file">رقم الملف</th>
                  <th class="qt-time">الوقت</th>
                  <th class="qt-countdown">المتبقي</th>
                  <th class="qt-fee">الأتعاب</th>
                  <th class="qt-status">الحالة</th>
                  <th class="qt-actions">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in displayedQueue" :key="a.id" class="qt-row" :class="'qr-' + (a.status || 'booked')">
                  <td class="qt-num"><span class="qt-num-badge">{{ i + 1 }}</span></td>
                  <td class="qt-patient">
                    <div class="qt-patient-cell">
                      <div class="qt-av" :style="{ background: avatarColor(a.full_name) }">{{ initials(a.full_name) }}</div>
                      <div class="qt-patient-text">
                        <span class="qt-name">{{ a.full_name }}</span>
                        <span class="qt-phone">{{ a.phone || '' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="qt-file"><span class="qt-file-num">{{ a.file_number || '—' }}</span></td>
                  <td class="qt-time"><span class="slot-time">{{ to12hShort(a.start_time) || '—' }}</span></td>
                  <td class="qt-countdown"><span v-if="a.start_time && a.status !== 'completed' && a.status !== 'missed'" class="countdown-badge">{{ countdownReactive(a.appointment_date, a.start_time) }}</span><span v-else>—</span></td>
                  <td class="qt-fee">
                    <div class="fee-cell">
                      <span v-if="a.status === 'completed' && a.consultation_fee" class="fee-paid">مدفوع · {{ Number(a.consultation_fee).toLocaleString() }} د.ع</span>
                      <span v-else-if="a.consultation_fee" class="fee-amount">{{ Number(a.consultation_fee).toLocaleString() }} د.ع</span>
                      <span v-else class="fee-none">—</span>
                      <button v-if="a.status === 'completed' || (a.consultation_fee && a.status !== 'booked')" class="fee-edit-btn" title="تعديل الأتعاب" @click="openEditFeeModal(a)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                  </td>
                  <td class="qt-status"><span class="qt-badge" :class="'badge-' + (a.status || 'booked')">{{ statusLabel(a) }}</span></td>
                  <td class="qt-actions">
                    <div class="qt-action-btns">
                      <button v-if="!a.status || a.status === 'booked'" class="abtn abtn-green" @click="markArrived(a)">دخول</button>
                      <button v-if="a.status === 'arrived'" class="abtn abtn-purple" @click="openFeeModal(a)">اكتمل</button>
                      <button v-if="a.status === 'completed'" class="abtn abtn-done" disabled>تم</button>
                      <button v-if="a.status === 'missed'" class="abtn abtn-gone" disabled>غاب</button>
                      <button v-if="a.device_id" class="abtn abtn-chat" title="محادثة المريض" @click="openPatientChat(a.device_id)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      </button>
                      <button class="abtn abtn-delete" title="حذف الحجز" @click="confirmDeleteQueue(a)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ARCHIVE TAB -->
        <div v-if="currentTab === 'archive'" class="archive-panel">
          <div class="ap-toolbar">
            <div class="ap-date-picker">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#21A8E0" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              <input v-model="archiveDate" type="date" @change="loadArchive" />
            </div>
          </div>
          <div v-if="archiveLoading" class="empty-box"><div class="spinner"></div></div>
          <div v-else-if="archiveAppointments.length === 0" class="empty-box"><p>لا توجد حجوزات لهذا التاريخ</p></div>
          <div v-else class="queue-table-wrap">
            <table class="queue-table archive-table">
              <thead>
                <tr>
                  <th class="qt-num">#</th>
                  <th class="qt-patient">المريض</th>
                  <th class="qt-file">رقم الملف</th>
                  <th class="qt-time">الوقت</th>
                  <th class="qt-fee">الأتعاب</th>
                  <th class="qt-status">الحالة</th>
                  <th class="qt-pay">الدفع</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(a, i) in archiveAppointments" :key="a.id" class="qt-row" :class="'qr-' + (a.status || 'booked')">
                  <td class="qt-num"><span class="qt-num-badge">{{ i + 1 }}</span></td>
                  <td class="qt-patient">
                    <div class="qt-patient-cell">
                      <div class="qt-av" :style="{ background: avatarColor(a.full_name) }">{{ initials(a.full_name) }}</div>
                      <div class="qt-patient-text">
                        <span class="qt-name">{{ a.full_name }}</span>
                        <span class="qt-phone">{{ a.phone || '' }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="qt-file"><span class="qt-file-num">{{ a.file_number || '—' }}</span></td>
                  <td class="qt-time"><span class="slot-time">{{ to12hShort(a.start_time) || '—' }}</span></td>
                  <td class="qt-fee">
                    <span v-if="a.consultation_fee" class="fee-amount">{{ Number(a.consultation_fee).toLocaleString() }} د.ع</span>
                    <span v-else class="fee-none">—</span>
                  </td>
                  <td class="qt-status"><span class="qt-badge" :class="'badge-' + (a.status || 'booked')">{{ statusLabel(a) }}</span></td>
                  <td class="qt-pay">
                    <span v-if="a.payment_status === 'paid'" class="pay-badge pay-paid">مدفوع</span>
                    <span v-else-if="a.payment_status === 'review'" class="pay-badge pay-review">مراجعة</span>
                    <span v-else class="pay-badge pay-unpaid">غير مدفوع</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- BOOKING MODAL -->
      <div v-if="showBookingModal" class="modal-overlay" @click.self="showBookingModal = false">
        <div class="modal">
          <div class="modal-head"><h3>حجز موعد</h3><button class="modal-close" @click="showBookingModal = false">✕</button></div>
          <div class="modal-body">
            <div v-if="nextSlotWarning" class="slot-warning">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {{ nextSlotWarning }}
            </div>
            <div v-if="!booking.patient_id" class="form-field">
              <label>المريض *</label>
              <input v-model="bookingSearch" type="text" placeholder="ابحث عن المريض بالاسم أو رقم الهاتف..." @input="onBookingSearch" />
              <div v-if="bookingPatients.length > 0" class="picker-list">
                <div v-for="p in bookingPatients" :key="p.id" class="picker-item" @click="pickPatient(p)">
                  <div class="pi-av" :style="{ background: avatarColor(p.full_name) }">{{ initials(p.full_name) }}</div>
                  <div><span class="pi-name">{{ p.full_name }}</span><span class="pi-meta">{{ p.phone || '' }} {{ p.file_number ? '· رقم ' + p.file_number : '' }}</span></div>
                </div>
              </div>
              <div class="or-divider"><span>أو</span></div>
              <button class="btn-add-new-patient" @click="showBookingModal = false; openAddPatientModal()">+ إضافة مريض جديد</button>
            </div>
            <div v-else class="selected-chip">
              <div class="sc-av" :style="{ background: avatarColor(booking.patient_name) }">{{ initials(booking.patient_name) }}</div>
              <div class="sc-info">
                <span class="sc-name">{{ booking.patient_name }}</span>
                <span class="sc-meta" v-if="booking.patient_phone">{{ booking.patient_phone }}</span>
                <span class="sc-meta" v-if="booking.patient_age"> · {{ booking.patient_age }} سنة</span>
              </div>
              <button class="sc-remove" @click="clearBookingPatient">✕</button>
            </div>
            <div class="form-row">
              <div class="form-field"><label>التاريخ *</label><input v-model="booking.date" type="date" /></div>
              <div class="form-field"><label>من</label><input v-model="booking.start_time" type="time" /></div>
              <div class="form-field"><label>إلى</label><input v-model="booking.end_time" type="time" /></div>
            </div>
            <div class="form-field"><label>أتعاب الاستشارة (د.ع)</label><input v-model.number="booking.fee" type="number" min="0" step="1000" placeholder="25000" /></div>
            <div class="form-field"><label>ملاحظات</label><textarea v-model="booking.notes" rows="2" placeholder="اختياري..."></textarea></div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showBookingModal = false">إلغاء</button>
            <button class="btn-save" @click="saveBooking" :disabled="!booking.patient_id || !booking.date || savingBooking">
              <span v-if="savingBooking" class="btn-spinner"></span>
              {{ savingBooking ? 'جاري...' : 'تأكيد الحجز' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ADD PATIENT MODAL -->
      <div v-if="showAddPatientModal" class="modal-overlay" @click.self="showAddPatientModal = false">
        <div class="modal modal-lg">
          <div class="modal-head"><h3>{{ editingPatient ? 'تعديل بيانات المريض' : 'إضافة مريض جديد' }}</h3><button class="modal-close" @click="showAddPatientModal = false">✕</button></div>
          <div class="modal-body">
            <div class="form-row">
              <div class="form-field"><label>الاسم الكامل <em>*</em></label><input v-model="newPatient.full_name" type="text" required placeholder="مثال: أحمد محمد علي" /></div>
              <div class="form-field"><label>العمر</label><input v-model.number="newPatient.age" type="number" min="0" max="130" placeholder="35" /></div>
            </div>
            <div class="form-row">
              <div class="form-field"><label>الجنس</label><select v-model="newPatient.gender"><option value="">— اختر —</option><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select></div>
              <div class="form-field"><label>فصيلة الدم</label><select v-model="newPatient.blood_type"><option value="">— اختر —</option><option v-for="bt in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bt" :value="bt">{{ bt }}</option></select></div>
            </div>
            <div class="form-row">
              <div class="form-field"><label>الوزن (كغم)</label><input v-model.number="newPatient.weight" type="number" min="0" max="500" step="0.1" placeholder="70" /></div>
              <div class="form-field"><label>الطول (سم)</label><input v-model.number="newPatient.height" type="number" min="0" max="300" step="0.1" placeholder="170" /></div>
            </div>
            <div class="form-row">
              <div class="form-field"><label>رقم الهاتف</label><input v-model="newPatient.phone" type="tel" placeholder="07701234567" /></div>
              <div class="form-field"><label>العنوان</label><input v-model="newPatient.address" type="text" placeholder="مثال: بغداد - الكرادة" /></div>
            </div>
            <div class="form-field"><label>مرض مزمن</label><textarea v-model="newPatient.chronic_disease" rows="2" placeholder="اكتب هنا إن كان المريض يعاني من مرض مزمن..."></textarea></div>
            <div class="form-field"><label>ملاحظات</label><textarea v-model="newPatient.notes" rows="2" placeholder="ملاحظات إضافية عن المريض..."></textarea></div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showAddPatientModal = false">إلغاء</button>
            <button class="btn-save" @click="savePatient" :disabled="!newPatient.full_name.trim() || savingPatient">
              <span v-if="savingPatient" class="btn-spinner"></span>
              {{ savingPatient ? 'جاري...' : (editingPatient ? 'حفظ التعديلات' : 'حفظ') }}
            </button>
          </div>
        </div>
      </div>

      <!-- FEE MODAL -->
      <div v-if="showFeeModal" class="modal-overlay" @click.self="showFeeModal = false">
        <div class="modal modal-sm">
          <div class="modal-head"><h3>إتمام الاستشارة</h3><button class="modal-close" @click="showFeeModal = false">✕</button></div>
          <div class="modal-body">
            <p class="fee-patient">{{ feePatient?.full_name }}</p>
            <div class="form-field"><label>أتعاب الاستشارة (د.ع)</label><input v-model.number="completeFee" type="number" min="0" step="1000" placeholder="25000" /></div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showFeeModal = false">إلغاء</button>
            <button class="btn-save" @click="confirmComplete" :disabled="savingComplete">
              <span v-if="savingComplete" class="btn-spinner"></span>
              {{ savingComplete ? 'جاري...' : 'تأكيد' }}
            </button>
          </div>
        </div>
      </div>

      <!-- EDIT FEE MODAL -->
      <div v-if="showEditFeeModal" class="modal-overlay" @click.self="showEditFeeModal = false">
        <div class="modal modal-sm">
          <div class="modal-head"><h3>تعديل الأتعاب</h3><button class="modal-close" @click="showEditFeeModal = false">✕</button></div>
          <div class="modal-body">
            <p class="fee-patient">{{ editFeeTarget?.full_name }}</p>
            <div class="form-field"><label>الأتعاب (د.ع)</label><input v-model.number="editFeeValue" type="number" min="0" step="1000" placeholder="25000" /></div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showEditFeeModal = false">إلغاء</button>
            <button class="btn-save" @click="saveEditFee" :disabled="savingEditFee">
              <span v-if="savingEditFee" class="btn-spinner"></span>
              {{ savingEditFee ? 'جاري...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </div>

      <!-- SET TIME MODAL -->
      <div v-if="showSetTimeModal" class="modal-overlay" @click.self="showSetTimeModal = false">
        <div class="modal modal-sm">
          <div class="modal-head"><h3>تحديد موعد المريض</h3><button class="modal-close" @click="showSetTimeModal = false">✕</button></div>
          <div class="modal-body">
            <div class="set-time-patient">
              <div class="st-av" :style="{ background: avatarColor(setTimeTarget?.patient_name) }">{{ initials(setTimeTarget?.patient_name) }}</div>
              <div><span class="st-name">{{ setTimeTarget?.patient_name || '' }}</span><span v-if="setTimeTarget?.phone" class="st-phone">{{ setTimeTarget.phone }}</span></div>
            </div>
            <div class="form-field" style="margin-top:16px"><label>التاريخ</label><input v-model="setTimeDate" type="date" /></div>
            <div class="form-field" style="margin-top:12px"><label>الوقت</label><input v-model="setTimeTime" type="time" /></div>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showSetTimeModal = false">إلغاء</button>
            <button class="btn-save" @click="confirmSetTime" :disabled="savingNotif || !setTimeDate">
              <span v-if="savingNotif" class="btn-spinner"></span>
              {{ savingNotif ? 'جاري...' : 'موافقة وتحديد الوقت' }}
            </button>
          </div>
        </div>
      </div>

      <!-- DELETE CONFIRM MODAL -->
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal modal-sm">
          <div class="modal-head"><h3>تأكيد الحذف</h3><button class="modal-close" @click="showDeleteConfirm = false">✕</button></div>
          <div class="modal-body">
            <p style="margin:0;color:#64748b;font-size:.9rem;">هل تريد حذف حجز <strong style="color:#1e293b">{{ deleteTarget?.full_name }}</strong> ؟</p>
          </div>
          <div class="modal-foot">
            <button class="btn-cancel" @click="showDeleteConfirm = false">إلغاء</button>
            <button class="btn-delete" @click="deleteQueueItem">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              حذف
            </button>
          </div>
        </div>
      </div>

      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.msg }}</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { collection, query, where, onSnapshot, limit, updateDoc, doc, getDocs, addDoc } from 'firebase/firestore'
import { patientsRepo, appointmentsRepo, settingsRepo } from '@/services/clinic'
import { to12h, to12hShort, formatArabicDate, timeUntil, timeAgoAr, playNotifSound } from '@/utils/time'

const now = ref(Date.now())
let timerInterval = null
const countdownReactive = (date, time) => { now.value; return timeUntil(date, time) }

const auth = useAuthStore()
const clinicId = computed(() => auth.clinicId)
const secretaryName = computed(() => auth.fullName || 'السكرتير')
const secretaryInitials = computed(() => (auth.fullName || 'S').split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase())

const bellBtnRef = ref(null)
const notifDropdownStyle = computed(() => {
  if (!bellBtnRef.value) return {}
  const rect = bellBtnRef.value.getBoundingClientRect()
  return {
    position: 'fixed',
    top: (rect.bottom + 8) + 'px',
    right: (window.innerWidth - rect.right) + 'px'
  }
})

function toggleNotifPanel() {
  showNotifPanel.value = !showNotifPanel.value
}

const todayQueue = ref([])
  const _n = new Date(); const todayKey = `${_n.getFullYear()}-${String(_n.getMonth()+1).padStart(2,'0')}-${String(_n.getDate()).padStart(2,'0')}`
const searchQuery = ref('')
const searchResults = ref([])
const searching = ref(false)
const notifications = ref([])
const unreadNotifCount = ref(0)
const showNotifPanel = ref(false)
const pendingBookings = ref([])
let lastPendingCount = 0
const savingNotif = ref(false)
const showSetTimeModal = ref(false)
const setTimeTarget = ref(null)
const setTimeDate = ref(todayKey)
const setTimeTime = ref('')
const showBookingModal = ref(false)
const showAddPatientModal = ref(false)
const showFeeModal = ref(false)
const savingBooking = ref(false)
const savingPatient = ref(false)
const savingComplete = ref(false)
const toast = ref({ show: false, msg: '', type: 'success' })
const feePatient = ref(null)
const completeFee = ref(null)
const showEditFeeModal = ref(false)
const editFeeTarget = ref(null)
const editFeeValue = ref(null)
const savingEditFee = ref(false)
const bookingSearch = ref('')
const bookingPatients = ref([])
const booking = ref({ patient_id: '', patient_name: '', patient_phone: '', patient_age: null, date: todayKey, start_time: '', end_time: '', fee: null, notes: '' })
const newPatient = ref({ full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' })
const editingPatient = ref(null)
const returnToBookingAfterAdd = ref(false)
const defaultConsultationFee = ref(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)
const unreadChatCount = ref(0)
const chatNotifications = ref([])
let lastChatCount = 0
let unsubChatRooms = null

const slotInterval = ref(20)
const clinicOpenTime = ref('')
const clinicCloseTime = ref('')
const showSettings = ref(false)
const nextSlotWarning = ref('')

const currentTab = ref('queue')
const queueView = ref('active')
const archiveDate = ref(todayKey)
const archiveAppointments = ref([])
const archiveLoading = ref(false)

const counts = computed(() => {
  const q = todayQueue.value
  return {
    booked: q.filter(a => !a.status || a.status === 'booked').length,
    arrived: q.filter(a => a.status === 'arrived').length,
    completed: q.filter(a => a.status === 'completed').length,
    missed: q.filter(a => a.status === 'missed').length
  }
})

const activeQueue = computed(() =>
  todayQueue.value.filter(a => a.status === 'booked' || a.status === 'arrived' || !a.status)
)

const archivedQueue = computed(() =>
  todayQueue.value.filter(a => a.status === 'completed' || a.status === 'missed')
)

const displayedQueue = computed(() => {
  if (queueView.value === 'active') return activeQueue.value
  if (queueView.value === 'archive') return archivedQueue.value
  return todayQueue.value
})

const arrivedCount = computed(() => todayQueue.value.filter(a => a.status === 'arrived').length)
const completedCount = computed(() => todayQueue.value.filter(a => a.status === 'completed').length)
const todayRevenue = computed(() => todayQueue.value.filter(a => a.status === 'completed' && a.consultation_fee).reduce((s, a) => s + (Number(a.consultation_fee) || 0), 0))

const colors = ['#1150c9','#0d9488','#d69e1f','#8b5cf6','#ec4899','#ef4444','#06b6d4','#f97316']
function avatarColor(n) { if (!n) return colors[0]; let h = 0; for (let i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h); return colors[Math.abs(h) % colors.length] }
function initials(n) { if (!n) return '?'; return n.split(' ').map(x => x[0]).join('').substring(0, 2).toUpperCase() }
function statusLabel(a) { return { booked: 'محجوز', arrived: 'دخل', completed: 'اكتمل', missed: 'غياب' }[a.status || 'booked'] }
function showToast(msg, type = 'success') { toast.value = { show: true, msg, type }; setTimeout(() => toast.value.show = false, 3000) }

function getNextTimeSlot() {
  const open = clinicOpenTime.value || '08:00'
  const close = clinicCloseTime.value || '14:00'
  const interval = slotInterval.value || 20
  const bookedCount = todayQueue.value.filter(a => a.status !== 'missed').length
  const [oH, oM] = open.split(':').map(Number)
  const totalMinutes = oH * 60 + oM + (bookedCount * interval)
  const [cH, cM] = close.split(':').map(Number)
  const closeMinutes = cH * 60 + cM
  if (totalMinutes >= closeMinutes) {
    nextSlotWarning.value = 'انتهت مواعيد اليوم'
    return open
  }
  nextSlotWarning.value = ''
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const pad = n => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}`
}

function openBookingModal(patient) {
  nextSlotWarning.value = ''
  booking.value = {
    patient_id: patient?.id || '',
    patient_name: patient?.full_name || '',
    patient_phone: patient?.phone || '',
    patient_age: patient?.age || null,
    date: todayKey,
    start_time: getNextTimeSlot(),
    end_time: '',
    fee: defaultConsultationFee.value ?? null,
    notes: ''
  }
  bookingSearch.value = patient?.full_name || ''
  bookingPatients.value = []
  showBookingModal.value = true
}

function openAddPatientModal() {
  editingPatient.value = null
  newPatient.value = { full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' }
  returnToBookingAfterAdd.value = false
  showAddPatientModal.value = true
}

function openEditPatient(p) {
  editingPatient.value = p
  newPatient.value = {
    full_name: p.full_name || '',
    age: p.age || null,
    gender: p.gender || '',
    blood_type: p.blood_type || '',
    weight: p.weight || null,
    height: p.height || null,
    phone: p.phone || '',
    address: p.address || '',
    chronic_disease: p.chronic_disease || '',
    notes: p.notes || ''
  }
  searchQuery.value = ''
  searchResults.value = []
  showAddPatientModal.value = true
}

let searchTimeout = null
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

let bookingTimeout = null
function onBookingSearch() {
  clearTimeout(bookingTimeout)
  if (booking.value.patient_id) return
  const q = bookingSearch.value.trim()
  if (!q) { bookingPatients.value = []; return }
  bookingTimeout = setTimeout(async () => {
    try { bookingPatients.value = await patientsRepo.list(clinicId.value, q) } catch (e) { bookingPatients.value = [] }
  }, 300)
}

function openBookingFor(p) {
  nextSlotWarning.value = ''
  booking.value = {
    patient_id: p.id,
    patient_name: p.full_name,
    patient_phone: p.phone || '',
    patient_age: p.age || null,
    date: todayKey,
    start_time: getNextTimeSlot(),
    end_time: '',
    fee: defaultConsultationFee.value ?? null,
    notes: ''
  }
  bookingSearch.value = p.full_name
  searchQuery.value = ''
  searchResults.value = []
  showBookingModal.value = true
}

function pickPatient(p) {
  booking.value.patient_id = p.id
  booking.value.patient_name = p.full_name
  booking.value.patient_phone = p.phone || ''
  booking.value.patient_age = p.age || null
  bookingSearch.value = p.full_name
  bookingPatients.value = []
}

function clearBookingPatient() {
  booking.value.patient_id = ''
  booking.value.patient_name = ''
  booking.value.patient_phone = ''
  booking.value.patient_age = null
  bookingSearch.value = ''
}

async function saveBooking() {
  if (!booking.value.patient_id || !booking.value.date) return
  savingBooking.value = true
  try {
    await appointmentsRepo.create(
      clinicId.value,
      booking.value.patient_id,
      booking.value.date,
      booking.value.notes,
      booking.value.start_time,
      booking.value.end_time,
      booking.value.fee,
      secretaryName.value,
      {
        full_name: booking.value.patient_name,
        phone: booking.value.patient_phone,
        age: booking.value.patient_age,
        status: 'booked',
        doctor_id: clinicId.value
      }
    )
    showToast('تم حجز موعد ' + booking.value.patient_name + ' بنجاح')
    showBookingModal.value = false
    booking.value = { patient_id: '', patient_name: '', patient_phone: '', patient_age: null, date: todayKey, start_time: '', end_time: '', fee: null, notes: '' }
    bookingSearch.value = ''
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
  finally { savingBooking.value = false }
}

async function markArrived(a) {
  try {
    await appointmentsRepo.updateStatus(a.id, 'arrived')
    showToast('✓ ' + a.full_name + ' — تم تسجيل الدخول')
  } catch (e) { showToast('خطأ', 'error') }
}

async function markMissed(a) {
  try {
    await appointmentsRepo.updateStatus(a.id, 'missed')
    showToast('✕ ' + a.full_name + ' — لم يحضر')
  } catch (e) { showToast('خطأ', 'error') }
}

function openFeeModal(a) {
  feePatient.value = a
  completeFee.value = a.consultation_fee ?? defaultConsultationFee.value ?? null
  showFeeModal.value = true
}

async function confirmComplete() {
  if (!feePatient.value) return
  savingComplete.value = true
  try {
    await appointmentsRepo.complete(feePatient.value.id, completeFee.value)
    showToast('✓ تم الإتمام — ' + feePatient.value.full_name)
    showFeeModal.value = false
    feePatient.value = null
  } catch (e) { showToast('خطأ', 'error') }
  finally { savingComplete.value = false }
}

function openEditFeeModal(a) {
  editFeeTarget.value = a
  editFeeValue.value = a.consultation_fee ?? null
  showEditFeeModal.value = true
}

async function saveEditFee() {
  if (!editFeeTarget.value) return
  savingEditFee.value = true
  try {
    await updateDoc(doc(db, 'appointments', editFeeTarget.value.id), { consultation_fee: editFeeValue.value })
    showToast('✓ تم تعديل الأتعاب')
    showEditFeeModal.value = false
    editFeeTarget.value = null
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
  finally { savingEditFee.value = false }
}

function confirmDeleteQueue(appt) {
  deleteTarget.value = appt
  showDeleteConfirm.value = true
}

async function deleteQueueItem() {
  if (!deleteTarget.value) return
  try {
    await appointmentsRepo.remove(deleteTarget.value.id)
    todayQueue.value = todayQueue.value.filter(a => a.id !== deleteTarget.value.id)
    showToast('تم حذف الحجز')
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (e) { showToast('خطأ في الحذف', 'error') }
}

function openPatientChat(deviceId) {
  window.location.href = `/clinic/${clinicId.value}/secretary/chats`
}

function openChatFromNotif(n) {
  showNotifDropdown.value = false
  window.location.href = `/clinic/${clinicId.value}/secretary/chats`
}

async function savePatient() {
  if (!newPatient.value.full_name.trim()) return
  savingPatient.value = true
  try {
    if (editingPatient.value) {
      await patientsRepo.update(editingPatient.value.id, { ...newPatient.value })
      showToast('تم تعديل بيانات ' + newPatient.value.full_name)
    } else {
      const created = await patientsRepo.create(clinicId.value, { ...newPatient.value })
      showToast('تم إضافة ' + created.full_name + ' — رقم الملف: ' + created.file_number)
      showAddPatientModal.value = false
      newPatient.value = { full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' }
      openBookingFor(created)
      return
    }
    showAddPatientModal.value = false
    newPatient.value = { full_name: '', age: null, gender: '', blood_type: '', weight: null, height: null, phone: '', address: '', chronic_disease: '', notes: '' }
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
  finally { savingPatient.value = false }
}

async function loadDoctorSettings() {
  try {
    const ds = await settingsRepo.getDoctorInfo(clinicId.value)
    if (ds) {
      if (ds.consultation_fee !== undefined) defaultConsultationFee.value = ds.consultation_fee
      if (ds.clinic_open_time) clinicOpenTime.value = ds.clinic_open_time
      if (ds.clinic_close_time) clinicCloseTime.value = ds.clinic_close_time
      if (ds.slot_interval) slotInterval.value = ds.slot_interval
    }
  } catch (e) {}
}

async function saveInterval() {
  try {
    await settingsRepo.setDoctorInfo(clinicId.value, { slot_interval: slotInterval.value })
    showToast('تم حفظ الإعدادات')
    showSettings.value = false
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
}

async function approveBooking(pr) {
  savingNotif.value = true
  try {
    await updateDoc(doc(db, 'notifications', pr.id), { status: 'approved', handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', clinicId.value), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(doc(db, 'appointments', d.id), { status: 'approved' })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id, type: 'booking_approved',
        message: 'تمت الموافقة على حجزك — بانتظار تحديد الوقت',
        doctor_name: pr.doctor_name || '', clinicId: clinicId.value,
        status: 'approved', read: false, created_at: new Date().toISOString()
      })
    }
    pendingBookings.value = pendingBookings.value.filter(r => r.id !== pr.id)
    showToast('تمت الموافقة على حجز ' + (pr.patient_name || ''))
  } catch (e) { console.error('Approve error:', e); showToast('خطأ', 'error') }
  savingNotif.value = false
}

async function rejectBooking(pr) {
  savingNotif.value = true
  try {
    await updateDoc(doc(db, 'notifications', pr.id), { status: 'rejected', handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', clinicId.value), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(doc(db, 'appointments', d.id), { status: 'rejected' })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id, type: 'booking_rejected',
        message: 'تم رفض طلب الحجز عند د. ' + (pr.doctor_name || ''),
        doctor_name: pr.doctor_name || '', clinicId: clinicId.value,
        status: 'rejected', read: false, created_at: new Date().toISOString()
      })
    }
    pendingBookings.value = pendingBookings.value.filter(r => r.id !== pr.id)
    showToast('تم رفض الحجز')
  } catch (e) { console.error('Reject error:', e); showToast('خطأ', 'error') }
  savingNotif.value = false
}

function openSetTimeModal(pr) {
  setTimeTarget.value = pr
  setTimeDate.value = pr.appointment_date || todayKey
  setTimeTime.value = pr.start_time || ''
  showSetTimeModal.value = true
}

async function confirmSetTime() {
  if (!setTimeTarget.value) return
  savingNotif.value = true
  try {
    const pr = setTimeTarget.value
    await updateDoc(doc(db, 'notifications', pr.id), { status: 'approved', appointment_date: setTimeDate.value, start_time: setTimeTime.value, handled_at: new Date().toISOString() })
    const apptSnap = await getDocs(query(collection(db, 'appointments'), where('device_id', '==', pr.device_id), where('clinicId', '==', clinicId.value), where('status', '==', 'pending')))
    for (const d of apptSnap.docs) {
      await updateDoc(doc(db, 'appointments', d.id), { status: 'approved', appointment_date: setTimeDate.value, start_time: setTimeTime.value })
    }
    if (pr.device_id) {
      await addDoc(collection(db, 'patient_notifications'), {
        device_id: pr.device_id, type: 'booking_approved',
        message: 'تمت الموافقة على حجزك — ' + formatArabicDate(setTimeDate.value) + (setTimeTime.value ? ' الساعة ' + to12h(setTimeTime.value) : ''),
        doctor_name: pr.doctor_name || '', clinicId: clinicId.value,
        appointment_date: setTimeDate.value, start_time: setTimeTime.value,
        status: 'approved', read: false, created_at: new Date().toISOString()
      })
    }
    showSetTimeModal.value = false
    pendingBookings.value = pendingBookings.value.filter(r => r.id !== pr.id)
    showToast('تم تحديد الموعد')
  } catch (e) { console.error('Set time error:', e); showToast('خطأ', 'error') }
  savingNotif.value = false
}

async function loadArchive() {
  archiveLoading.value = true
  try {
    archiveAppointments.value = await appointmentsRepo.listByDate(clinicId.value, archiveDate.value)
  } catch (e) { archiveAppointments.value = [] }
  archiveLoading.value = false
}

let unsubs = []
onMounted(async () => {
  timerInterval = setInterval(() => { now.value = Date.now() }, 60000)
  if (!clinicId.value) return

  await loadDoctorSettings()

  unsubs = [
    onSnapshot(query(collection(db, 'appointments'), where('clinicId', '==', clinicId.value), where('appointment_date', '==', todayKey)), snap => {
      todayQueue.value = snap.docs.map(d => {
        const a = d.data()
        return {
          id: d.id, ...a,
          full_name: a.full_name || '---',
          phone: a.phone || '',
          file_number: a.file_number || '',
          status: a.status || (a.entered === 1 ? 'arrived' : a.missed === 1 ? 'missed' : 'booked')
        }
      }).sort((a, b) => {
        const o = { arrived: 0, booked: 1, completed: 2, missed: 3 }
        if (o[a.status] !== o[b.status]) return (o[a.status] || 0) - (o[b.status] || 0)
        return (a.start_time || '').localeCompare(b.start_time || '')
      })
    }),
    onSnapshot(query(collection(db, 'notifications'), where('clinicId', '==', clinicId.value), limit(50)), snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      notifications.value = all.filter(n => (n.toUserId === auth.uid || n.toUserId === 'all') && n.type !== 'message')
      pendingBookings.value = all.filter(n => n.type === 'booking_request' && n.status === 'pending')
      unreadNotifCount.value = notifications.value.filter(n => !n.read).length + pendingBookings.value.length + unreadChatCount.value
      if (pendingBookings.value.length > lastPendingCount) playNotifSound('default')
      lastPendingCount = pendingBookings.value.length
    })
  ]

  unsubChatRooms = onSnapshot(query(collection(db, 'patient_chat_rooms'), where('clinicId', '==', clinicId.value)), roomSnap => {
    const allRooms = {}
    roomSnap.docs.forEach(d => { allRooms[d.id] = { id: d.id, ...d.data() } })

    let totalUnread = 0
    const chatNotifs = []
    for (const [rid, r] of Object.entries(allRooms)) {
      const uc = r.unread_count || 0
      if (uc > 0) {
        totalUnread += uc
        chatNotifs.push({
          id: 'chat-' + rid,
          title: '💬 محادثة جديدة',
          message: (r.patient_name || 'مريض') + ' — ' + uc + ' رسالة جديدة',
          read: false,
          roomId: rid,
          type: 'chat'
        })
      }
    }

    if (lastChatCount > 0 && totalUnread > lastChatCount) {
      playNotifSound('chat')
      const latestRoom = chatNotifs[0]
      showToast('💬 رسالة جديدة من ' + (latestRoom?.message || 'مريض'))
    }
    lastChatCount = totalUnread
    unreadChatCount.value = totalUnread
    chatNotifications.value = chatNotifs
  }, () => { unreadChatCount.value = 0; chatNotifications.value = [] })
})
onUnmounted(() => { unsubs.forEach(u => { if (typeof u === 'function') u() }); if (unsubChatRooms) unsubChatRooms(); clearTimeout(searchTimeout); clearTimeout(bookingTimeout); if (timerInterval) clearInterval(timerInterval) })
</script>

<style scoped>
.dash { padding: 24px 28px; max-width: 1200px; margin: 0 auto; background: #F5F5F7; min-height: 100vh; }
.dash-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.dh-actions { display: flex; gap: 8px; flex-shrink: 0; }
.dh-circle-btn { width: 42px; height: 42px; border-radius: 50%; background: #fff; border: none; display: grid; place-items: center; color: #64748b; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.06); position: relative; transition: all 0.2s; }
.dh-circle-btn:hover { color: #21A8E0; }
.dh-chat-btn { text-decoration: none; color: #0d9488; }
.dh-chat-btn:hover { color: #0f766e; }
.notif-badge { position: absolute; top: -2px; right: -2px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
.nd-overlay { position: fixed; inset: 0; z-index: 999; background: transparent; }
.notif-dropdown { position: fixed; width: 340px; max-width: calc(100vw - 24px); background: #fff; border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.12); z-index: 1000; max-height: 70vh; overflow-y: auto; }
.nd-header { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; justify-content: space-between; }
.nd-header h3 { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0; }
.nd-unread-text { font-size: 0.68rem; font-weight: 700; color: #f59e0b; background: #fef3c7; padding: 3px 8px; border-radius: 6px; }
.nd-pending-section { padding: 12px; border-bottom: 1px solid #f1f5f9; }
.nd-pending-title { font-size: 0.72rem; font-weight: 700; color: #f59e0b; margin-bottom: 10px; }
.nd-booking-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 10px 12px; margin-bottom: 8px; }
.nd-bc-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.nd-bc-avatar { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 0.55rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.nd-bc-info { flex: 1; min-width: 0; }
.nd-bc-name { display: block; font-size: 0.82rem; font-weight: 700; color: #1e293b; }
.nd-bc-phone { display: block; font-size: 0.68rem; color: #94a3b8; }
.nd-bc-reason { font-size: 0.68rem; color: #92400e; margin-bottom: 4px; }
.nd-bc-date { display: flex; align-items: center; gap: 4px; font-size: 0.68rem; color: #64748b; margin-bottom: 8px; }
.nd-bc-actions { display: flex; gap: 4px; }
.nd-btn { display: inline-flex; align-items: center; gap: 4px; padding: 5px 10px; border-radius: 7px; font-size: 0.68rem; font-weight: 700; border: none; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.nd-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.nd-btn-reject { background: #fee2e2; color: #dc2626; }
.nd-btn-reject:hover:not(:disabled) { background: #fecaca; }
.nd-btn-time { background: #eff6ff; color: #1150c9; }
.nd-btn-time:hover:not(:disabled) { background: #dbeafe; }
.nd-btn-approve { background: #dcfce7; color: #16a34a; }
.nd-btn-approve:hover:not(:disabled) { background: #bbf7d0; }
.nd-empty { text-align: center; padding: 24px; color: #94a3b8; }
.nd-empty p { font-size: 0.82rem; margin: 0; }
.nd-list { }
.nd-item { padding: 10px 16px; border-bottom: 1px solid #f8fafc; }
.nd-item.unread { background: rgba(33,168,224,0.03); }
.nd-item.nd-chat { cursor: pointer; display: flex; align-items: flex-start; gap: 10px; background: rgba(13,148,136,0.04); }
.nd-item.nd-chat:hover { background: rgba(13,148,136,0.08); }
.nd-icon-chat { font-size: 1.2rem; flex-shrink: 0; margin-top: 2px; }
.nd-title { display: block; font-size: 0.78rem; font-weight: 700; color: #1e293b; }
.nd-msg { display: block; font-size: 0.72rem; color: #64748b; margin-top: 2px; }
.dropdown-enter-active { transition: all 0.2s ease; }
.dropdown-leave-active { transition: all 0.15s ease; }
.dropdown-enter-from { opacity: 0; transform: translateY(-8px); }
.dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
.dh-search { flex: 1; display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.dh-search input { flex: 1; border: none; outline: none; font-size: 0.88rem; color: #1e293b; background: transparent; font-family: inherit; }
.dh-search input::placeholder { color: #94a3b8; }
.dh-clear { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; }
.dh-profile { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.dh-info { text-align: left; }
.dh-info h1 { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
.dh-title { font-size: 0.72rem; color: #94a3b8; }
.dh-dots { display: flex; flex-direction: column; gap: 5px; }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot-pink { background: #D81B8A; }
.dot-yellow { background: #f59e0b; }
.dh-avatar { width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #D81B8A, #be185d); display: grid; place-items: center; box-shadow: 0 4px 12px rgba(216,27,138,0.25); }
.dh-avatar span { color: #fff; font-size: 0.9rem; font-weight: 800; }

.settings-panel { position: absolute; top: calc(100% + 10px); right: 0; width: 300px; background: #fff; border-radius: 14px; box-shadow: 0 16px 48px rgba(0,0,0,0.12); z-index: 200; overflow: hidden; }
.sp-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid #f1f5f9; }
.sp-header h3 { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin: 0; }
.sp-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; }
.sp-close:hover { color: #ef4444; }
.sp-body { padding: 16px; }
.sp-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
.sp-label { font-size: 0.78rem; color: #64748b; font-weight: 600; }
.sp-value { font-size: 0.82rem; color: #1e293b; font-weight: 700; }
.sp-divider { height: 1px; background: #f1f5f9; margin: 8px 0; }
.sp-field { margin-top: 4px; }
.sp-field label { display: block; font-size: 0.72rem; font-weight: 600; color: #64748b; margin-bottom: 6px; }
.sp-input-row { display: flex; gap: 8px; }
.sp-input-row input { flex: 1; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; color: #1e293b; outline: none; font-family: inherit; }
.sp-input-row input:focus { border-color: #21A8E0; box-shadow: 0 0 0 3px rgba(33,168,224,0.08); }
.sp-save { padding: 8px 16px; border-radius: 8px; border: none; background: linear-gradient(135deg, #21A8E0, #0ea5e9); color: #fff; font-size: 0.78rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.sp-save:hover { box-shadow: 0 4px 12px rgba(33,168,224,0.3); }

.dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
.stat-card { background: #fff; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s, box-shadow 0.2s; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.08); }
.stat-body { flex: 1; }
.stat-val { display: block; font-size: 1.4rem; font-weight: 800; color: #1e293b; }
.stat-val small { font-size: 0.65rem; color: #94a3b8; }
.stat-label { display: block; font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }
.stat-icon { width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; flex-shrink: 0; }
.si-blue { background: rgba(33,168,224,0.1); color: #21A8E0; }
.si-green { background: rgba(16,185,129,0.1); color: #10b981; }
.si-purple { background: rgba(139,92,246,0.1); color: #8b5cf6; }
.si-gold { background: rgba(245,158,11,0.1); color: #f59e0b; }

.dash-actions { display: flex; gap: 12px; margin-bottom: 20px; }
.act-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 14px; border: none; cursor: pointer; font-size: 0.88rem; font-weight: 700; color: #fff; font-family: inherit; transition: all 0.25s; box-shadow: 0 4px 16px rgba(0,0,0,0.1); }
.act-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.act-blue { background: linear-gradient(135deg, #21A8E0, #0ea5e9); }
.act-pink { background: linear-gradient(135deg, #D81B8A, #be185d); }
.act-gold { background: linear-gradient(135deg, #f59e0b, #d97706); }

.search-section { animation: fadeUp 0.2s ease; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.empty-box { display: flex; flex-direction: column; align-items: center; padding: 40px; color: #94a3b8; }
.empty-box p { font-size: 0.85rem; margin: 0; }
.spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #21A8E0; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.results-list { display: flex; flex-direction: column; gap: 6px; }
.result-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-radius: 12px; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.04); transition: all 0.15s; }
.result-row:hover { box-shadow: 0 4px 12px rgba(33,168,224,0.12); }
.rr-avatar { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.rr-info { flex: 1; }
.rr-name { display: block; font-size: 0.85rem; font-weight: 600; color: #1e293b; }
.rr-meta { display: block; font-size: 0.7rem; color: #94a3b8; }
.rr-actions { display: flex; gap: 6px; flex-shrink: 0; }
.rr-book-btn { padding: 6px 14px; border-radius: 8px; border: none; background: #21A8E0; color: #fff; font-size: 0.75rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.rr-book-btn:hover { background: #0ea5e9; }
.rr-edit-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; display: grid; place-items: center; font-size: 0.75rem; cursor: pointer; color: #64748b; }
.rr-edit-btn:hover { border-color: #21A8E0; color: #21A8E0; }

.tab-section { animation: fadeUp 0.2s ease; }
.tab-bar { display: flex; gap: 4px; margin-bottom: 16px; background: #fff; border-radius: 12px; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.tab-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 20px; border-radius: 10px; border: none; background: transparent; font-size: 0.85rem; font-weight: 700; color: #64748b; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.tab-btn.active { background: #21A8E0; color: #fff; box-shadow: 0 4px 12px rgba(33,168,224,0.25); }
.tab-btn:hover:not(.active) { background: #f1f5f9; color: #1e293b; }

.queue-panel, .archive-panel { background: #fff; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.qp-toolbar { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
.qp-filters { display: flex; gap: 6px; flex-wrap: wrap; }
.qp-filters button { padding: 6px 14px; border-radius: 999px; border: 1px solid #e5e7eb; background: #fff; font-size: 0.75rem; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.qp-filters button.active { background: #21A8E0; color: #fff; border-color: #21A8E0; }
.qp-filters button:hover:not(.active) { border-color: #21A8E0; color: #21A8E0; }

.ap-toolbar { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; }
.ap-date-picker { display: flex; align-items: center; gap: 10px; }
.ap-date-picker input { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; color: #1e293b; outline: none; font-family: inherit; }
.ap-date-picker input:focus { border-color: #21A8E0; box-shadow: 0 0 0 3px rgba(33,168,224,0.08); }

.slot-warning { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #fef3c7; color: #92400e; border-radius: 10px; font-size: 0.82rem; font-weight: 600; margin-bottom: 14px; }

.queue-table-wrap { overflow-x: auto; }
.queue-table { width: 100%; border-collapse: collapse; }
.queue-table thead { background: #f8fafc; }
.queue-table th { padding: 12px 16px; font-size: 0.72rem; font-weight: 700; color: #64748b; text-align: right; white-space: nowrap; border-bottom: 2px solid #f1f5f9; }
.queue-table td { padding: 14px 16px; font-size: 0.82rem; color: #1e293b; border-bottom: 1px solid #f8fafc; vertical-align: middle; }
.qt-row { transition: background 0.15s; }
.qt-row:hover { background: #f8fafc; }
.qt-row.qr-completed { opacity: 0.6; }
.qt-row.qr-missed { opacity: 0.5; }
.qt-num { width: 50px; text-align: center; }
.qt-num-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: #f1f5f9; font-size: 0.75rem; font-weight: 700; color: #64748b; }
.qt-patient-cell { display: flex; align-items: center; gap: 10px; }
.qt-av { width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; font-size: 0.65rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.qt-patient-text { display: flex; flex-direction: column; min-width: 0; }
.qt-name { font-size: 0.85rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.qt-phone { font-size: 0.7rem; color: #94a3b8; }
.qt-file { width: 100px; }
.qt-file-num { font-size: 0.78rem; font-weight: 700; color: #64748b; background: #f1f5f9; padding: 3px 10px; border-radius: 6px; }
.qt-time { width: 80px; }
.slot-time { display: inline-block; padding: 4px 10px; border-radius: 8px; background: #eff6ff; color: #0369a1; font-size: 0.78rem; font-weight: 700; }
.countdown-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; background: #f0fdf4; color: #15803d; font-size: 0.72rem; font-weight: 700; }
.qt-countdown { width: 110px; }
.qt-fee { width: 150px; }
.fee-paid { display: inline-block; padding: 4px 10px; border-radius: 8px; background: #dcfce7; color: #15803d; font-size: 0.72rem; font-weight: 700; }
.fee-amount { font-size: 0.78rem; font-weight: 600; color: #1e293b; }
.fee-none { color: #cbd5e1; }
.fee-cell { display: flex; align-items: center; gap: 6px; }
.fee-edit-btn { width: 22px; height: 22px; border: none; border-radius: 6px; background: #eff6ff; color: #1150c9; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s; flex-shrink: 0; }
.fee-edit-btn:hover { background: #dbeafe; transform: scale(1.1); }
.qt-status { width: 90px; }
.qt-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.7rem; font-weight: 700; }
.badge-booked { background: #e0f2fe; color: #0369a1; }
.badge-arrived { background: #fef3c7; color: #92400e; }
.badge-completed { background: #dcfce7; color: #15803d; }
.badge-missed { background: #fef2f2; color: #dc2626; }
.qt-actions { width: 120px; }
.qt-action-btns { display: flex; gap: 6px; }
.abtn { padding: 6px 14px; border-radius: 8px; border: none; font-size: 0.72rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; white-space: nowrap; }
.abtn-green { background: #dcfce7; color: #15803d; }
.abtn-green:hover { background: #bbf7d0; box-shadow: 0 2px 8px rgba(16,185,129,0.2); }
.abtn-purple { background: #ede9fe; color: #6d28d9; }
.abtn-purple:hover { background: #ddd6fe; box-shadow: 0 2px 8px rgba(139,92,246,0.2); }
.abtn-done { background: #dcfce7; color: #15803d; opacity: 0.6; cursor: default; }
.abtn-gone { background: #fef2f2; color: #dc2626; opacity: 0.5; cursor: default; }
.abtn-chat { background: #e0f2fe; color: #0369a1; }
.abtn-chat:hover { background: #bae6fd; box-shadow: 0 2px 8px rgba(14,165,233,0.2); }
.abtn-delete { background: #fef2f2; color: #dc2626; }
.abtn-delete:hover { background: #fee2e2; box-shadow: 0 2px 8px rgba(239,68,68,0.2); }
.btn-delete { display: inline-flex; align-items: center; gap: 6px; padding: 8px 20px; border-radius: 8px; border: none; background: #dc2626; color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-delete:hover { background: #b91c1c; }
.chat-badge { background: #0d9488; }

.archive-table .qt-pay { width: 100px; }
.pay-badge { display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 700; }
.pay-paid { background: #dcfce7; color: #15803d; }
.pay-review { background: #fef3c7; color: #92400e; }
.pay-unpaid { background: #f1f5f9; color: #94a3b8; }

.modal { width: 90%; max-width: 560px; max-height: 85vh; background: #fff; border-radius: 16px; box-shadow: 0 24px 64px rgba(0,0,0,0.15); display: flex; flex-direction: column; overflow: hidden; animation: modalIn 0.25s ease; }
.modal-lg { max-width: 700px; }
.modal-sm { max-width: 380px; }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
.modal-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; }
.modal-head h3 { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1.1rem; padding: 4px; }
.modal-close:hover { color: #ef4444; }
.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 20px; border-top: 1px solid #f1f5f9; }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 12px; }
.form-field { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; position: relative; }
.form-field label { font-size: 0.72rem; font-weight: 600; color: #64748b; }
.form-field label em { color: #ef4444; font-style: normal; }
.form-field input, .form-field select, .form-field textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 0.85rem; color: #1e293b; background: #fff; outline: none; font-family: inherit; transition: border-color 0.2s; }
.form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #21A8E0; box-shadow: 0 0 0 3px rgba(33,168,224,0.08); }

.picker-list { position: absolute; top: 100%; left: 0; right: 0; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 10; max-height: 180px; overflow-y: auto; }
.picker-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; cursor: pointer; transition: background 0.1s; }
.picker-item:hover { background: #f8fafc; }
.pi-av { width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center; font-size: 0.55rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.pi-name { display: block; font-size: 0.8rem; font-weight: 600; color: #1e293b; }
.pi-meta { display: block; font-size: 0.68rem; color: #94a3b8; }

.or-divider { text-align: center; margin: 8px 0; position: relative; }
.or-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #e5e7eb; }
.or-divider span { position: relative; background: #fff; padding: 0 10px; font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
.btn-add-new-patient { width: 100%; padding: 10px; border: 2px dashed #21A8E0; border-radius: 10px; background: rgba(33,168,224,0.03); color: #21A8E0; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-add-new-patient:hover { background: rgba(33,168,224,0.08); border-color: #0ea5e9; }

.selected-chip { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #eff6ff; border-radius: 10px; margin-bottom: 16px; }
.sc-av { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 0.6rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.sc-info { flex: 1; min-width: 0; }
.sc-name { display: block; font-size: 0.88rem; font-weight: 700; color: #1e293b; }
.sc-meta { font-size: 0.72rem; color: #64748b; }
.sc-remove { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 6px; flex-shrink: 0; }
.sc-remove:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

.fee-patient { font-size: 0.95rem; font-weight: 700; color: #1e293b; margin: 0 0 14px; }
.set-time-patient { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #eff6ff; border-radius: 10px; margin-bottom: 14px; }
.st-av { width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center; font-size: 0.55rem; font-weight: 700; color: #fff; flex-shrink: 0; }
.st-name { display: block; font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.st-phone { display: block; font-size: 0.72rem; color: #64748b; }
.btn-cancel { padding: 8px 16px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; font-size: 0.82rem; font-weight: 600; color: #64748b; cursor: pointer; font-family: inherit; transition: all 0.15s; }
.btn-cancel:hover { background: #f1f5f9; }
.btn-save { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 8px; border: none; background: linear-gradient(135deg, #21A8E0, #0ea5e9); color: #fff; font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.btn-save:hover { box-shadow: 0 4px 16px rgba(33,168,224,0.3); }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }
.btn-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 768px) {
  .dash { padding: 14px; }
  .dash-header { flex-wrap: wrap; gap: 10px; }
  .dh-search { order: 10; width: 100%; }
  .dash-stats { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .stat-card { padding: 14px; }
  .stat-val { font-size: 1.1rem; }
  .dash-actions { flex-direction: column; }
  .tab-bar { flex-direction: column; }
  .qp-filters { overflow-x: auto; flex-wrap: nowrap; }
  .qp-filters button { white-space: nowrap; }
  .queue-table th, .queue-table td { padding: 10px 8px; font-size: 0.72rem; }
  .qt-patient-text { display: none; }
  .qt-phone { display: none; }
  .qt-file { display: none; }
  .qt-time { display: none; }
  .form-row { grid-template-columns: 1fr; }
  .modal { width: 95%; max-width: none; }
  .modal-lg { max-width: none; }
}
</style>
