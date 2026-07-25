<template>
  <AppLayout>

      <!-- VIEW 0: Hub -->
      <section v-if="currentView === 'hub'" class="view active">
        <header class="view-header">
          <div class="view-title">
            <h2>السجل الطبي</h2>
            <p>التشخيص والأدوية لمرضى حجوزات اليوم</p>
          </div>
        </header>
        <div class="billing-hub medical-hub">
          <button class="billing-hub-btn billing-hub-blue" @click="currentView = 'diagnosis-patients'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 2h6a1 1 0 0 1 1 1v2H8V3a1 1 0 0 1 1-1z"/>
              <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 12h6M9 16h6" stroke-linecap="round"/>
            </svg>
            <span>تشخيص</span>
          </button>
          <button class="billing-hub-btn billing-hub-teal" @click="currentView = 'prescription-patients'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h6" stroke-linecap="round"/>
            </svg>
            <span>أدوية</span>
          </button>
        </div>
      </section>

      <!-- VIEW 1: Diagnosis Patients List -->
      <section v-if="currentView === 'diagnosis-patients'" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="goToHub">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>تشخيص</h2>
              <p>مرضى حجوزات اليوم</p>
            </div>
          </div>
          <div class="view-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="بحث بالاسم أو رقم الهاتف..." />
            </div>
          </div>
        </header>
        <div class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">تسلسل</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th class="col-book">تشخيص</th>
                  <th class="col-history">السجل السابق</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(patient, index) in filteredDiagnosisPatients" :key="patient.id">
                  <td class="cell-muted col-seq">{{ index + 1 }}</td>
                  <td class="cell-name">{{ patient.full_name }}</td>
                  <td class="cell-muted">{{ patient.phone || '—' }}</td>
                  <td class="col-book">
                    <button class="btn-table btn-table-book" @click="openDiagnosisForPatient(patient)">
                      <span>تشخيص</span>
                    </button>
                  </td>
                  <td class="col-history">
                    <button class="btn-table btn-table-book" @click="viewDiagnosisHistory(patient)">
                      <span>سجل</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredDiagnosisPatients.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
            <p>لا توجد حجوزات لليوم بعد.</p>
          </div>
        </div>
      </section>

      <!-- VIEW 2: Diagnosis Detail (A5 Sheet) -->
      <section v-if="currentView === 'diagnosis-detail'" class="view active">
        <header class="view-header no-print">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'diagnosis-patients'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>{{ selectedPatient?.full_name }}</h2>
              <p>تشخيص زيارة اليوم</p>
            </div>
          </div>
          <div class="view-actions">
            <button v-if="!isEditing" class="btn btn-gold btn-lg" @click="startEditing">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 20h9" stroke-linecap="round"/>
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>تعديل</span>
            </button>
            <button v-if="isEditing" class="btn btn-primary btn-lg" @click="saveDiagnosis">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حفظ</span>
            </button>
            <button class="btn btn-gold btn-lg" @click="printDiagnosis">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>طباعة</span>
            </button>
            <button class="btn btn-danger btn-lg" @click="deleteDiagnosis">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </header>
        <div class="a5-sheet-wrap">
          <div class="a5-sheet">
            <div class="a5-header">
              <span class="a5-clinic-name">{{ doctorInfo?.clinic_name || 'عيادتي' }}</span>
              <span v-if="doctorInfo?.doctor_name && doctorInfo.doctor_name !== doctorInfo.clinic_name" class="a5-doctor-name">{{ doctorInfo.doctor_name }}</span>
              <span class="a5-doctor-bio">{{ doctorInfo?.doctor_bio || '' }}</span>
            </div>
            <div class="a5-patient-row">
              <div class="a5-patient-field">
                <span class="a5-field-label">اسم المريض</span>
                <span class="a5-field-value">{{ selectedPatient?.full_name }}</span>
              </div>
              <div class="a5-patient-field">
                <span class="a5-field-label">العمر</span>
                <span class="a5-field-value">{{ selectedPatient?.age || 'غير محدد' }}</span>
              </div>
              <div class="a5-patient-field">
                <span class="a5-field-label">التاريخ</span>
                <span class="a5-field-value">{{ formatDate(todayDate) }}</span>
              </div>
            </div>
            <div class="a5-rx">
              <span class="a5-rx-label">التشخيص</span>
              <textarea v-model="diagnosisContent" :disabled="!isEditing" class="a5-rx-textarea" placeholder="اكتب تشخيص المريض هنا..."></textarea>
            </div>
            <div class="a5-footer">
              <span class="a5-footer-text">{{ doctorInfo?.clinic_address || '' }}</span>
              <img v-if="patientQrUrl" :src="patientQrUrl" class="a5-qr" alt="QR" />
              <span class="a5-footer-text">{{ doctorInfo?.phone1 || '' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- VIEW 3: Diagnosis History -->
      <section v-if="currentView === 'diagnosis-history'" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'diagnosis-patients'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>سجل التشخيصات - {{ selectedPatient?.full_name }}</h2>
              <p>جميع التشخيصات عبر الزيارات</p>
            </div>
          </div>
        </header>
        <div class="table-card installment-card">
          <div class="installment-list">
            <div v-for="record in diagnosisHistory" :key="record.id" class="installment-row">
              <span class="installment-row-label">{{ formatDate(record.appointment_date) }}</span>
              <button class="btn-table btn-table-history" @click="openDiagnosisFromHistory(record)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>عرض</span>
              </button>
            </div>
          </div>
          <div v-if="diagnosisHistory.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9 12h6M9 16h6" stroke-linecap="round"/>
              <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p>لا يوجد تشخيص سابق لهذا المريض.</p>
          </div>
        </div>
      </section>

      <!-- VIEW 4: Prescription Patients List -->
      <section v-if="currentView === 'prescription-patients'" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="goToHub">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>أدوية</h2>
              <p>مرضى حجوزات اليوم</p>
            </div>
          </div>
          <div class="view-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" stroke-linecap="round"/>
              </svg>
              <input v-model="searchQuery" type="text" placeholder="بحث بالاسم أو رقم الهاتف..." />
            </div>
          </div>
        </header>
        <div class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead>
                <tr>
                  <th class="col-seq">تسلسل</th>
                  <th>الاسم الكامل</th>
                  <th>رقم الهاتف</th>
                  <th class="col-book">وصفة</th>
                  <th class="col-history">السجل السابق</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(patient, index) in filteredPrescriptionPatients" :key="patient.id">
                  <td class="cell-muted col-seq">{{ index + 1 }}</td>
                  <td class="cell-name">{{ patient.full_name }}</td>
                  <td class="cell-muted">{{ patient.phone || '—' }}</td>
                  <td class="col-book">
                    <button class="btn-table btn-table-history" @click="openPrescriptionForPatient(patient)">
                      <span>وصفة</span>
                    </button>
                  </td>
                  <td class="col-history">
                    <button class="btn-table btn-table-book" @click="viewPrescriptionHistory(patient)">
                      <span>سجل</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredPrescriptionPatients.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/>
            </svg>
            <p>لا توجد حجوزات لليوم بعد.</p>
          </div>
        </div>
      </section>

      <!-- VIEW 5: Prescription Detail (A5 Sheet) -->
      <section v-if="currentView === 'prescription-detail'" class="view active">
        <header class="view-header no-print">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'prescription-patients'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>وصفة طبية</h2>
              <p>{{ selectedPatient?.full_name }} - {{ formatDate(todayDate) }}</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary btn-lg" @click="savePrescription">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حفظ</span>
            </button>
            <button class="btn btn-gold btn-lg" @click="printPrescription">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>طباعة</span>
            </button>
            <button class="btn btn-danger btn-lg" @click="deletePrescription">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </header>
        <div class="a5-sheet-wrap">
          <div class="a5-sheet">
            <div class="a5-header">
              <span class="a5-clinic-name">{{ doctorInfo?.clinic_name || 'عيادتي' }}</span>
              <span v-if="doctorInfo?.doctor_name && doctorInfo.doctor_name !== doctorInfo.clinic_name" class="a5-doctor-name">{{ doctorInfo.doctor_name }}</span>
              <span class="a5-doctor-bio">{{ doctorInfo?.doctor_bio || '' }}</span>
            </div>
            <div class="a5-patient-row">
              <div class="a5-patient-field">
                <span class="a5-field-label">اسم المريض</span>
                <span class="a5-field-value">{{ selectedPatient?.full_name }}</span>
              </div>
              <div class="a5-patient-field">
                <span class="a5-field-label">العمر</span>
                <span class="a5-field-value">{{ selectedPatient?.age || 'غير محدد' }}</span>
              </div>
              <div class="a5-patient-field">
                <span class="a5-field-label">التاريخ</span>
                <span class="a5-field-value">{{ formatDate(todayDate) }}</span>
              </div>
            </div>
            <div class="a5-rx">
              <span class="a5-rx-label">Rx/</span>
              <textarea v-model="prescriptionContent" class="a5-rx-textarea" placeholder="اكتب الوصفة الطبية هنا..."></textarea>
            </div>
            <div class="a5-footer">
              <span class="a5-footer-text">{{ doctorInfo?.clinic_address || '' }}</span>
              <img v-if="patientQrUrl" :src="patientQrUrl" class="a5-qr" alt="QR" />
              <span class="a5-footer-text">{{ doctorInfo?.phone1 || '' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- VIEW 6: Prescription History -->
      <section v-if="currentView === 'prescription-history'" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'prescription-patients'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>سجل الوصفات - {{ selectedPatient?.full_name }}</h2>
              <p>جميع الوصفات عبر الزيارات</p>
            </div>
          </div>
        </header>
        <div class="table-card installment-card">
          <div class="installment-list">
            <div v-for="record in prescriptionHistory" :key="record.id" class="installment-row">
              <span class="installment-row-label">{{ formatDate(record.appointment_date) }}</span>
              <button class="btn-table btn-table-history" @click="openPrescriptionFromHistory(record)">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>عرض</span>
              </button>
            </div>
          </div>
          <div v-if="prescriptionHistory.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <path d="M14 2v6h6M9 13h6M9 17h6" stroke-linecap="round"/>
            </svg>
            <p>لا توجد وصفات سابقة لهذا المريض.</p>
          </div>
        </div>
      </section>

      <!-- Print Preview - Diagnosis -->
      <div v-if="showPrintPreview === 'diagnosis'" class="modal-overlay" @click.self="closePrintPreview">
        <div class="modal">
          <div class="modal-header">
            <h3>معاينة الطباعة</h3>
            <button class="icon-btn" @click="closePrintPreview">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="a5-sheet-wrap">
              <div class="a5-sheet" id="diagnosis-print-content">
                <div class="a5-header">
                  <span class="a5-clinic-name">{{ doctorInfo?.clinic_name || 'عيادتي' }}</span>
                  <span v-if="doctorInfo?.doctor_name && doctorInfo.doctor_name !== doctorInfo.clinic_name" class="a5-doctor-name">{{ doctorInfo.doctor_name }}</span>
                  <span class="a5-doctor-bio">{{ doctorInfo?.doctor_bio || '' }}</span>
                </div>
                <div class="a5-patient-row">
                  <div class="a5-patient-field">
                    <span class="a5-field-label">اسم المريض</span>
                    <span class="a5-field-value">{{ selectedPatient?.full_name }}</span>
                  </div>
                  <div class="a5-patient-field">
                    <span class="a5-field-label">العمر</span>
                    <span class="a5-field-value">{{ selectedPatient?.age || 'غير محدد' }}</span>
                  </div>
                  <div class="a5-patient-field">
                    <span class="a5-field-label">التاريخ</span>
                    <span class="a5-field-value">{{ formatDate(todayDate) }}</span>
                  </div>
                </div>
                <div class="a5-rx">
                  <span class="a5-rx-label">التشخيص</span>
                  <div class="a5-rx-textarea" style="white-space:pre-wrap;line-height:1.8;min-height:150px;padding:10px">{{ diagnosisContent }}</div>
                </div>
                <div class="a5-footer">
                  <span class="a5-footer-text">{{ doctorInfo?.clinic_address || '' }}</span>
                  <img v-if="patientQrUrl" :src="patientQrUrl" class="a5-qr" alt="QR" />
                  <span class="a5-footer-text">{{ doctorInfo?.phone1 || '' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-gold btn-lg" @click="printNow('diagnosis')">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Print Preview - Prescription -->
      <div v-if="showPrintPreview === 'prescription'" class="modal-overlay" @click.self="closePrintPreview">
        <div class="modal">
          <div class="modal-header">
            <h3>معاينة الطباعة</h3>
            <button class="icon-btn" @click="closePrintPreview">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M18 6 6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="a5-sheet-wrap">
              <div class="a5-sheet" id="prescription-print-content">
                <div class="a5-header">
                  <span class="a5-clinic-name">{{ doctorInfo?.clinic_name || 'عيادتي' }}</span>
                  <span v-if="doctorInfo?.doctor_name && doctorInfo.doctor_name !== doctorInfo.clinic_name" class="a5-doctor-name">{{ doctorInfo.doctor_name }}</span>
                  <span class="a5-doctor-bio">{{ doctorInfo?.doctor_bio || '' }}</span>
                </div>
                <div class="a5-patient-row">
                  <div class="a5-patient-field">
                    <span class="a5-field-label">اسم المريض</span>
                    <span class="a5-field-value">{{ selectedPatient?.full_name }}</span>
                  </div>
                  <div class="a5-patient-field">
                    <span class="a5-field-label">العمر</span>
                    <span class="a5-field-value">{{ selectedPatient?.age || 'غير محدد' }}</span>
                  </div>
                  <div class="a5-patient-field">
                    <span class="a5-field-label">التاريخ</span>
                    <span class="a5-field-value">{{ formatDate(todayDate) }}</span>
                  </div>
                </div>
                <div class="a5-rx">
                  <span class="a5-rx-label">Rx/</span>
                  <div class="a5-rx-textarea" style="white-space:pre-wrap;line-height:1.8;min-height:150px;padding:10px">{{ prescriptionContent }}</div>
                </div>
                <div class="a5-footer">
                  <span class="a5-footer-text">{{ doctorInfo?.clinic_address || '' }}</span>
                  <img v-if="patientQrUrl" :src="patientQrUrl" class="a5-qr" alt="QR" />
                  <span class="a5-footer-text">{{ doctorInfo?.phone1 || '' }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-gold btn-lg" @click="printNow('prescription')">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span>طباعة</span>
            </button>
          </div>
        </div>
      </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { db } from '@/firebase/config'
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore'
import QRCode from 'qrcode'
import {
  diagnosesRepo,
  prescriptionsRepo,
  appointmentsRepo,
  patientsRepo,
  settingsRepo
} from '../../services/clinic'

const authStore = useAuthStore()
const clinicId = computed(() => authStore.clinicId)
const todayDate = new Date().toISOString().slice(0, 10)

const currentView = ref('hub')
const searchQuery = ref('')
const isEditing = ref(false)
const showPrintPreview = ref(null)

const selectedPatient = ref(null)
const selectedAppointment = ref(null)

const allPatients = ref([])
const todayAppointments = ref([])
const diagnosisContent = ref('')
const prescriptionContent = ref('')
const diagnosisHistory = ref([])
const prescriptionHistory = ref([])
const doctorInfo = ref(null)
const patientQrUrl = ref('')

async function generatePatientQr() {
  if (!selectedPatient.value || !clinicId.value) { patientQrUrl.value = ''; return }
  try {
    const url = `${window.location.origin}/patient/${clinicId.value}/${selectedPatient.value.id}`
    patientQrUrl.value = await QRCode.toDataURL(url, { width: 120, margin: 1, color: { dark: '#1e293b', light: '#ffffff' } })
  } catch (e) { patientQrUrl.value = '' }
}

onMounted(async () => {
  await Promise.all([
    loadDoctorInfo(),
    loadAllPatients(),
    loadTodayAppointments()
  ])
})

async function loadDoctorInfo() {
  try { doctorInfo.value = await settingsRepo.getDoctorInfo(clinicId.value) } catch (e) { /* silent */ }
}

async function loadAllPatients() {
  try { allPatients.value = await patientsRepo.list(clinicId.value) } catch (e) { /* silent */ }
}

async function loadTodayAppointments() {
  try {
    const snap = await getDocs(query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId.value),
      where('appointment_date', '==', todayDate)
    ))
    todayAppointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) { /* silent */ }
}

const filteredDiagnosisPatients = computed(() => {
  if (!searchQuery.value) return allPatients.value
  const q = searchQuery.value.toLowerCase()
  return allPatients.value.filter(p => p.full_name?.toLowerCase().includes(q) || (p.phone || '').includes(q))
})

const filteredPrescriptionPatients = computed(() => {
  if (!searchQuery.value) return allPatients.value
  const q = searchQuery.value.toLowerCase()
  return allPatients.value.filter(p => p.full_name?.toLowerCase().includes(q) || (p.phone || '').includes(q))
})

function goToHub() {
  currentView.value = 'hub'
  searchQuery.value = ''
}

async function findOrCreateAppointment(patientId) {
  let apt = todayAppointments.value.find(a => a.patient_id === patientId)
  if (apt) return apt
  await appointmentsRepo.create(clinicId.value, patientId, todayDate)
  const snap = await getDocs(query(
    collection(db, 'appointments'),
    where('clinicId', '==', clinicId.value),
    where('appointment_date', '==', todayDate)
  ))
  todayAppointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return todayAppointments.value.find(a => a.patient_id === patientId) || null
}

async function openDiagnosisForPatient(patient) {
  selectedPatient.value = patient
  searchQuery.value = ''
  isEditing.value = false
  diagnosisContent.value = ''
  currentView.value = 'diagnosis-detail'
  generatePatientQr()
  try {
    const apt = await findOrCreateAppointment(patient.id)
    selectedAppointment.value = apt
    if (apt) {
      const diag = await diagnosesRepo.get(clinicId.value, apt.id)
      diagnosisContent.value = diag?.content || ''
    }
  } catch (e) { /* silent */ }
}

async function openDiagnosisFromHistory(record) {
  selectedPatient.value = { id: record.patient_id, full_name: record.full_name, age: record.age }
  selectedAppointment.value = { id: record.appointment_id || record.id, appointment_date: record.appointment_date }
  diagnosisContent.value = record.content || ''
  isEditing.value = false
  currentView.value = 'diagnosis-detail'
}

async function openPrescriptionForPatient(patient) {
  selectedPatient.value = patient
  searchQuery.value = ''
  prescriptionContent.value = ''
  currentView.value = 'prescription-detail'
  generatePatientQr()
  try {
    const apt = await findOrCreateAppointment(patient.id)
    selectedAppointment.value = apt
    if (apt) {
      const presc = await prescriptionsRepo.get(clinicId.value, apt.id)
      prescriptionContent.value = presc?.content || ''
    }
  } catch (e) { /* silent */ }
}

async function openPrescriptionFromHistory(record) {
  selectedPatient.value = { id: record.patient_id, full_name: record.full_name, age: record.age }
  selectedAppointment.value = { id: record.appointment_id || record.id, appointment_date: record.appointment_date }
  prescriptionContent.value = record.content || ''
  currentView.value = 'prescription-detail'
}

async function viewDiagnosisHistory(patient) {
  selectedPatient.value = patient
  currentView.value = 'diagnosis-history'
  try {
    const diagSnap = await getDocs(query(
      collection(db, 'diagnoses'),
      where('clinicId', '==', clinicId.value),
      where('patient_id', '==', patient.id)
    ))
    const diagnoses = diagSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (diagnoses.length === 0) { diagnosisHistory.value = []; return }
    const apptIds = [...new Set(diagnoses.map(d => d.appointment_id))]
    const apptSnaps = await Promise.all(
      apptIds.map(id => getDocs(query(
        collection(db, 'appointments'),
        where('__name__', '==', id)
      )))
    )
    const apptMap = {}
    apptSnaps.forEach(snap => {
      snap.docs.forEach(d => { apptMap[d.id] = d.data().appointment_date })
    })
    diagnosisHistory.value = diagnoses
      .map(d => ({ ...d, appointment_date: apptMap[d.appointment_id] || '' }))
      .sort((a, b) => (b.appointment_date || '').localeCompare(a.appointment_date || ''))
  } catch (e) { diagnosisHistory.value = [] }
}

async function viewPrescriptionHistory(patient) {
  selectedPatient.value = patient
  currentView.value = 'prescription-history'
  try {
    const [snap1, snap2] = await Promise.all([
      getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId.value), where('patient_id', '==', patient.id))).catch(() => ({ docs: [] })),
      getDocs(query(collection(db, 'prescriptions'), where('clinicId', '==', clinicId.value), where('patientId', '==', patient.id))).catch(() => ({ docs: [] }))
    ])
    const seen = new Set()
    const prescriptions = []
    for (const d of [...snap1.docs, ...snap2.docs]) {
      if (!seen.has(d.id)) { seen.add(d.id); prescriptions.push({ id: d.id, ...d.data() }) }
    }
    if (prescriptions.length === 0) { prescriptionHistory.value = []; return }
    const apptIds = [...new Set(prescriptions.map(p => p.appointment_id).filter(Boolean))]
    const apptSnaps = await Promise.all(
      apptIds.map(id => getDoc(doc(db, 'appointments', id)).catch(() => null))
    )
    const apptMap = {}
    apptSnaps.forEach(snap => { if (snap?.exists()) apptMap[snap.id] = snap.data().appointment_date })
    prescriptionHistory.value = prescriptions
      .map(p => ({ ...p, appointment_date: apptMap[p.appointment_id] || p.appointment_date || '' }))
      .sort((a, b) => (b.appointment_date || b.created_at || '').localeCompare(a.appointment_date || a.created_at || ''))
  } catch (e) { prescriptionHistory.value = [] }
}

function startEditing() { isEditing.value = true }

async function saveDiagnosis() {
  if (!selectedAppointment.value) return
  try {
    await diagnosesRepo.save(clinicId.value, selectedAppointment.value.id, selectedPatient.value.id, diagnosisContent.value)
    isEditing.value = false
  } catch (e) { alert('حدث خطأ أثناء الحفظ') }
}

async function deleteDiagnosis() {
  if (!confirm('هل أنت متأكد من حذف هذا التشخيص؟')) return
  try {
    await diagnosesRepo.remove(clinicId.value, selectedAppointment.value.id)
    diagnosisContent.value = ''
    currentView.value = 'diagnosis-patients'
  } catch (e) { alert('حدث خطأ أثناء الحذف') }
}

async function savePrescription() {
  if (!selectedAppointment.value) return
  try {
    await prescriptionsRepo.save(clinicId.value, selectedAppointment.value.id, selectedPatient.value.id, prescriptionContent.value, {
      full_name: selectedPatient.value.full_name,
      age: selectedPatient.value.age,
      patientName: selectedPatient.value.full_name
    })
  } catch (e) { alert('حدث خطأ أثناء الحفظ') }
}

async function deletePrescription() {
  if (!confirm('هل أنت متأكد من حذف هذه الوصفة؟')) return
  try {
    await prescriptionsRepo.remove(clinicId.value, selectedAppointment.value.id)
    prescriptionContent.value = ''
    currentView.value = 'prescription-patients'
  } catch (e) { alert('حدث خطأ أثناء الحذف') }
}

function printDiagnosis() { showPrintPreview.value = 'diagnosis' }
function printPrescription() { showPrintPreview.value = 'prescription' }

function printNow(type) {
  const contentId = type === 'diagnosis' ? 'diagnosis-print-content' : 'prescription-print-content'
  const content = document.getElementById(contentId)
  if (!content) return
  const printWindow = window.open('', '_blank', 'width=794,height=1123')
  printWindow.document.write(`<!DOCTYPE html><html dir="rtl"><head><meta charset="UTF-8"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl}.a5-sheet{width:148mm;height:210mm;padding:15mm;margin:0 auto;background:white}.a5-header{text-align:center;margin-bottom:10px}.a5-clinic-name{text-align:center;font-size:22px;font-weight:bold;color:#1a5276;display:block;margin-bottom:5px}.a5-doctor-bio{text-align:center;font-size:14px;color:#666;display:block;margin-bottom:10px}.a5-patient-row{display:flex;justify-content:space-between;margin:10px 0;border-top:2px solid #1a5276;border-bottom:2px solid #1a5276;padding:8px 0}.a5-patient-field{display:flex;flex-direction:column;align-items:center;flex:1}.a5-field-label{font-size:12px;color:#888;margin-bottom:2px}.a5-field-value{font-size:14px;font-weight:bold;color:#333}.a5-rx{margin:10px 0}.a5-rx-label{font-weight:bold;font-size:16px;color:#1a5276;display:block;margin-bottom:5px}.a5-rx-textarea{min-height:120mm;padding:10px;font-size:14px;line-height:1.8;white-space:pre-wrap;word-wrap:break-word;color:#333;border:none;outline:none;width:100%;resize:none}.a5-footer{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #ddd;padding-top:8px}.a5-footer-text{font-size:12px;color:#666}.a5-qr{width:60px;height:60px;border-radius:4px}@media print{body{margin:0}.a5-sheet{margin:0;padding:15mm}}</style></head><body>${content.outerHTML}<script>setTimeout(function(){window.print();window.close()},500)<\/script></body></html>`)
  printWindow.document.close()
}

function closePrintPreview() { showPrintPreview.value = null }

function formatDate(dateStr) {
  if (!dateStr) return ''
  try { return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) } catch { return dateStr }
}
</script>

<style scoped>
.view-header { margin-bottom: 24px; }
.view-title h2 { font-size: 1.4rem; font-weight: 800; color: #1e293b; margin: 0; }
.view-title p { font-size: 0.82rem; color: #64748b; margin: 4px 0 0; }
.view-title-with-back { display: flex; align-items: flex-start; gap: 12px; }
.back-btn { background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; padding: 8px; cursor: pointer; color: #1e293b; transition: background 0.2s; flex-shrink: 0; margin-top: 2px; }
.back-btn:hover { background: rgba(255,255,255,0.9); }
.view-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.search-box { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; }
.search-box:focus-within { border-color: #1150c9; box-shadow: 0 0 0 3px rgba(17,80,201,0.08); }
.search-box svg { color: #94a3b8; flex-shrink: 0; }
.search-box input { border: none; outline: none; font-size: 0.85rem; color: #1e293b; background: none; width: 100%; font-family: inherit; }
.search-box input::placeholder { color: #94a3b8; }
.table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.installment-card { padding: 20px; }
.installment-list { display: flex; flex-direction: column; gap: 8px; }
.installment-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; }
.installment-row-label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 24px; color: #94a3b8; }
.empty-state p { font-size: 0.9rem; margin: 0; text-align: center; }
.icon-btn { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 8px; display: grid; place-items: center; }
.icon-btn:hover { background: #f1f5f9; color: #ef4444; }
.btn { padding: 10px 22px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; display: inline-flex; align-items: center; gap: 8px; }
.btn-lg { padding: 10px 20px; }
.btn-ghost { background: #f1f5f9; color: #64748b; }
.btn-ghost:hover { background: #e2e8f0; }
.btn-primary { background: #1150c9; color: #fff; }
.btn-primary:hover { background: #0e42a8; }
.btn-gold { background: #fef3c7; color: #92400e; }
.btn-gold:hover { background: #fde68a; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-table { padding: 6px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 600; border: 1px solid #e5e7eb; background: #fff; cursor: pointer; transition: all 0.2s; }
.btn-table-book { color: #1150c9; }
.btn-table-book:hover { background: #eff6ff; border-color: #1150c9; }
.btn-table-history { color: #0d9488; }
.btn-table-history:hover { background: #f0fdfa; border-color: #0d9488; }
.modal { background: #fff; border-radius: 20px; width: 90%; max-width: 680px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h3 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-body { padding: 20px 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }
.no-print {}
.a5-qr { width: 60px; height: 60px; border-radius: 4px; flex-shrink: 0; }

@media (max-width: 768px) {
  .view-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .view-actions { width: 100%; }
  .search-box { width: 100%; }
  .installment-row { flex-wrap: wrap; gap: 8px; }
}
@media (max-width: 480px) {
  .view-actions { flex-direction: column; }
  .view-actions .btn { width: 100%; justify-content: center; }
}
</style>
