<template>
  <AppLayout>
    <div class="settings-view-container">

      <!-- Settings Hub -->
      <section v-if="currentView === 'hub'" class="settings-section">
        <header class="view-header">
          <div class="view-title">
            <h2>الإعدادات</h2>
            <p>بيانات الدكتور والعيادة</p>
          </div>
        </header>
        <div class="billing-hub">
          <button class="billing-hub-btn billing-hub-blue" @click="currentView = 'info'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>معلومات</span>
          </button>
          <button class="billing-hub-btn billing-hub-gold" @click="currentView = 'account'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>حسابي</span>
          </button>
          <button class="billing-hub-btn billing-hub-purple" @click="currentView = 'billingSettings'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>إعدادات الفواتير</span>
          </button>
          <button class="billing-hub-btn billing-hub-teal" @click="currentView = 'clinicHours'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>ساعات العيادة</span>
          </button>
          <button class="billing-hub-btn billing-hub-teal" @click="currentView = 'backup'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M12 15V3M7 8l5-5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>نسخ احتياطي</span>
          </button>
          <button class="billing-hub-btn billing-hub-gold" @click="currentView = 'publicProfile'">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="10"/>
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
            <span>الملف العام</span>
          </button>
        </div>
      </section>

      <!-- معلومات -->
      <section v-if="currentView === 'info'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>معلومات</h2>
              <p>تظهر هذه البيانات أعلى وأسفل أوراق التشخيص والوصفة الطبية</p>
            </div>
          </div>
        </header>

        <form class="table-card installment-card" @submit.prevent="saveInfo">
          <div class="installment-total-row">
            <label>الصورة الشخصية</label>
            <div class="photo-upload-row">
              <div class="profile-photo-preview" @click="$refs.photoInput.click()">
                <img v-if="infoForm.photoUrl" :src="infoForm.photoUrl" alt="الصورة" />
                <div v-else class="avatar-placeholder">{{ initials }}</div>
                <div class="avatar-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span>رفع صورة</span>
                </div>
              </div>
              <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload" />
              <p v-if="uploadingPhoto" class="photo-hint">جاري الرفع...</p>
              <p v-else class="photo-hint">اضغط على الصورة لتغييرها</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-doctor-name">اسم الدكتور</label>
            <div class="installment-total-input-wrap">
              <input id="settings-doctor-name" v-model="infoForm.doctorName" type="text" placeholder="مثال: د. أحمد محمد" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-doctor-bio">الملف التعريفي للدكتور</label>
            <div class="installment-total-input-wrap">
              <textarea id="settings-doctor-bio" v-model="infoForm.doctorBio" rows="3" placeholder="مثال: أخصائي ... — شهادة البورد ..."></textarea>
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-clinic-address">عنوان العيادة</label>
            <div class="installment-total-input-wrap">
              <input id="settings-clinic-address" v-model="infoForm.address" type="text" placeholder="مثال: الموصل - حي البعث - مجمع الوتين الطبي" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-phone1">رقم هاتف العيادة الأول</label>
            <div class="installment-total-input-wrap">
              <input id="settings-phone1" v-model="infoForm.phone1" type="text" placeholder="مثال: 0770 000 0000" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-phone2">رقم هاتف العيادة الثاني</label>
            <div class="installment-total-input-wrap">
              <input id="settings-phone2" v-model="infoForm.phone2" type="text" placeholder="مثال: 0780 000 0000" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-whatsapp">رقم واتساب السكرتير (للحجز)</label>
            <div class="installment-total-input-wrap">
              <input id="settings-whatsapp" v-model="infoForm.whatsapp" type="text" placeholder="مثال: 0780 000 0000" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg fee-settings-save-btn" :disabled="savingInfo">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ savingInfo ? 'جاري الحفظ...' : 'حفظ' }}</span>
          </button>
        </form>
      </section>

      <!-- حسابي -->
      <section v-if="currentView === 'account'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>حسابي</h2>
              <p>معلومات الحساب وتغيير كلمة المرور</p>
            </div>
          </div>
        </header>

        <div class="account-sections">
          <div class="table-card installment-card">
            <div class="installment-total-row">
              <label>البريد الإلكتروني</label>
              <div class="installment-total-input-wrap">
                <input type="email" :value="accountInfo.email" disabled class="input-disabled" />
              </div>
            </div>
            <div class="installment-total-row">
              <label>الاسم</label>
              <div class="installment-total-input-wrap">
                <input type="text" :value="accountInfo.fullName" disabled class="input-disabled" />
              </div>
            </div>
            <div class="installment-total-row">
              <label>الدور</label>
              <div class="installment-total-input-wrap">
                <input type="text" value="صاحب العيادة" disabled class="input-disabled" />
              </div>
            </div>
          </div>

          <h3 class="account-section-title">تغيير كلمة المرور</h3>
          <form class="table-card installment-card" @submit.prevent="changePassword">
            <div class="installment-total-row">
              <label>كلمة المرور الحالية</label>
              <div class="installment-total-input-wrap">
                <input v-model="passwordForm.currentPassword" type="password" placeholder="أدخل كلمة المرور الحالية" />
              </div>
            </div>
            <div class="installment-total-row">
              <label>كلمة المرور الجديدة</label>
              <div class="installment-total-input-wrap">
                <input v-model="passwordForm.newPassword" type="password" placeholder="أدخل كلمة المرور الجديدة" />
              </div>
            </div>
            <div class="installment-total-row">
              <label>تأكيد كلمة المرور</label>
              <div class="installment-total-input-wrap">
                <input v-model="passwordForm.confirmPassword" type="password" placeholder="أعد إدخال كلمة المرور الجديدة" />
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-lg fee-settings-save-btn" :disabled="changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>{{ changingPassword ? 'جاري التحديث...' : 'تحديث كلمة المرور' }}</span>
            </button>
          </form>
        </div>
      </section>

      <!-- نسخ احتياطي -->
      <section v-if="currentView === 'backup'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>نسخ احتياطي واستعادة</h2>
              <p>احفظ نسخة من بياناتك أو استرجع نسخة سابقة</p>
            </div>
          </div>
        </header>

        <div class="table-card installment-card">
          <div class="backup-action-row">
            <div class="backup-action-text">
              <h3>نسخ احتياطي</h3>
              <p>يحفظ نسخة كاملة من بيانات العيادة (المرضى، المواعيد، الفواتير، السجل الطبي) في مكان تختاره.</p>
            </div>
            <button class="btn btn-primary btn-lg" @click="exportBackup">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 3v12M7 10l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 19h16" stroke-linecap="round"/>
              </svg>
              <span>نسخ احتياطي</span>
            </button>
          </div>
          <div class="backup-action-row">
            <div class="backup-action-text">
              <h3>استعادة</h3>
              <p>يستبدل كل البيانات الحالية بنسخة احتياطية سابقة.</p>
            </div>
            <button class="btn btn-danger btn-lg" @click="$refs.importInput.click()">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 21V9M7 14l5-5 5 5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 4h16" stroke-linecap="round"/>
              </svg>
              <span>استعادة</span>
            </button>
            <input ref="importInput" type="file" accept=".json" style="display:none" @change="importBackup" />
          </div>
        </div>
      </section>

      <!-- الملف العام -->
      <section v-if="currentView === 'publicProfile'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>الملف العام</h2>
              <p>فعّل ملفك العام ليظهر للمرضى في دليل الأطباء</p>
            </div>
          </div>
        </header>

        <form class="table-card installment-card" @submit.prevent="savePublicProfile">
          <div class="installment-total-row">
            <label>تفعيل الملف العام</label>
            <div class="installment-total-input-wrap">
              <label class="toggle-switch">
                <input type="checkbox" v-model="publicProfile.is_public" />
                <span class="toggle-slider"></span>
              </label>
              <p class="field-hint">عند التفعيل، سيظهر ملفك في دليل الأطباء للمرضى</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>التخصص الطبي</label>
            <div class="installment-total-input-wrap">
              <input v-model="publicProfile.specialty" type="text" placeholder="مثال: طب عام، أسنان، جلدية..." />
            </div>
          </div>
          <div class="installment-total-row">
            <label>نبذة عنك</label>
            <div class="installment-total-input-wrap">
              <textarea v-model="publicProfile.doctor_bio" rows="3" placeholder="اكتب نبذة مختصرة عن خبراتك وتخصصك..."></textarea>
            </div>
          </div>
          <div class="installment-total-row">
            <label>الرسوم (دينار عراقي)</label>
            <div class="installment-total-input-wrap">
              <input v-model.number="publicProfile.consultation_fee" type="number" min="0" step="1000" placeholder="مثال: 25000" />
              <p class="field-hint">تظهر للمرضى عند حجز الموعد</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>المنطقة / الحي</label>
            <div class="installment-total-input-wrap">
              <input v-model="publicProfile.area" type="text" placeholder="مثال: حي البعث، الزهور، النهضة..." />
              <p class="field-hint">تساعد المرضى في البحث حسب المنطقة</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>ساعات العمل (من)</label>
            <div class="installment-total-input-wrap">
              <input v-model="publicProfile.clinic_open_time" type="time" />
            </div>
          </div>
          <div class="installment-total-row">
            <label>ساعات العمل (إلى)</label>
            <div class="installment-total-input-wrap">
              <input v-model="publicProfile.clinic_close_time" type="time" />
            </div>
          </div>
          <div class="installment-total-row">
            <label>رابط الموقع على الخريطة</label>
            <div class="installment-total-input-wrap">
              <input v-model="publicProfile.map_url" type="url" placeholder="https://maps.app.goo.gl/... أو رابط Google Maps" />
              <p class="field-hint">افتح خرائط جوجل، ابحث عن عيادتك، ثم انسخ الرابط والصقه هنا</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>مختبر طبي</label>
            <div class="installment-total-input-wrap">
              <label class="toggle-switch">
                <input type="checkbox" v-model="publicProfile.is_lab" />
                <span class="toggle-slider"></span>
              </label>
              <p class="field-hint">فعّل إذا كنت مختبر طبي وليس عيادة</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>مستشفى</label>
            <div class="installment-total-input-wrap">
              <label class="toggle-switch">
                <input type="checkbox" v-model="publicProfile.is_hospital" />
                <span class="toggle-slider"></span>
              </label>
              <p class="field-hint">فعّل إذا كنت مستشفى</p>
            </div>
          </div>
          <div class="installment-total-row">
            <label>العروض والخصومات</label>
            <div class="installment-total-input-wrap">
              <div class="offers-list">
                <div v-for="(offer, idx) in publicProfile.offers" :key="idx" class="offer-item">
                  <input v-model="offer.title" type="text" placeholder="عنوان العرض" class="offer-input" />
                  <input v-model="offer.discount" type="text" placeholder="نسبة الخصم أو التفاصيل" class="offer-input" />
                  <button type="button" class="offer-remove" @click="publicProfile.offers.splice(idx, 1)">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>
              <button type="button" class="offer-add-btn" @click="publicProfile.offers.push({ title: '', discount: '' })">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                إضافة عرض
              </button>
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg fee-settings-save-btn" :disabled="savingPublicProfile">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ savingPublicProfile ? 'جاري الحفظ...' : 'حفظ' }}</span>
          </button>
          <div v-if="publicProfileLink" class="public-profile-link">
            <p>رابط ملفك العام:</p>
            <a :href="publicProfileLink" target="_blank">{{ publicProfileLink }}</a>
          </div>
        </form>
      </section>

      <!-- إعدادات الفواتير -->
      <section v-if="currentView === 'billingSettings'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>إعدادات الفواتير</h2>
              <p>الأسعار الافتراضية وقواعد المراجعة</p>
            </div>
          </div>
        </header>

        <form class="table-card installment-card" @submit.prevent="saveBillingSettings">
          <div class="installment-total-row">
            <label for="consultation-fee-input">سعر الكشفية / الاستشارة (دينار عراقي)</label>
            <div class="installment-total-input-wrap">
              <input id="consultation-fee-input" v-model.number="billingSettings.consultationFee" type="number" min="0" step="1000" placeholder="مثال: 25000" />
            </div>
            <p class="field-hint">يظهر تلقائياً عند السكرتير عند إتمام الاستشارة</p>
          </div>
          <div class="installment-total-row">
            <label for="exam-fee-input">مبلغ المعاينة (دينار عراقي)</label>
            <div class="installment-total-input-wrap">
              <input id="exam-fee-input" v-model.number="billingSettings.examFee" type="number" min="0" step="0.01" placeholder="0" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="review-fee-input">مبلغ المراجعة (دينار عراقي)</label>
            <div class="installment-total-input-wrap">
              <input id="review-fee-input" v-model.number="billingSettings.reviewFee" type="number" min="0" step="0.01" placeholder="0" />
            </div>
          </div>
          <div class="installment-total-row">
            <label for="settings-review-days">مراجعة — عدد الأيام المسموح بها للمراجعة</label>
            <div class="installment-total-input-wrap">
              <input id="settings-review-days" v-model.number="billingSettings.reviewDays" type="number" min="0" step="1" placeholder="مثال: 3" />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-lg fee-settings-save-btn" :disabled="savingBilling">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>{{ savingBilling ? 'جاري الحفظ...' : 'حفظ' }}</span>
          </button>
        </form>
      </section>

      <!-- ساعات العيادة -->
      <section v-if="currentView === 'clinicHours'" class="settings-section">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" title="رجوع" @click="currentView = 'hub'">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div>
              <h2>ساعات العمل</h2>
              <p>حدد أيام وساعات دوام العيادة</p>
            </div>
          </div>
        </header>

        <form class="table-card installment-card" @submit.prevent="saveClinicHours">
          <div class="schedule-list">
            <div v-for="(day, idx) in weeklySchedule" :key="day.name" class="schedule-row">
              <div class="schedule-day-info">
                <label class="toggle-switch">
                  <input type="checkbox" v-model="day.enabled" />
                  <span class="toggle-slider"></span>
                </label>
                <span :class="['schedule-day-name', day.enabled && 'active']">{{ day.name }}</span>
              </div>
              <div v-if="day.enabled" class="schedule-times">
                <div class="schedule-time-input">
                  <label>من</label>
                  <input v-model="day.from" type="time" />
                </div>
                <span class="schedule-time-sep">—</span>
                <div class="schedule-time-input">
                  <label>إلى</label>
                  <input v-model="day.to" type="time" />
                </div>
              </div>
              <div v-else class="schedule-off">إجازة</div>
            </div>
          </div>

          <div class="installment-total-row">
            <label for="slot-interval-input">الفترة الزمنية لكل موعد (دقيقة)</label>
            <div class="installment-total-input-wrap">
              <input id="slot-interval-input" v-model.number="clinicHoursForm.slotInterval" type="number" min="5" max="120" step="5" placeholder="20" />
            </div>
            <p class="field-hint">الوقت المقدر لكل مريض</p>
          </div>

          <div class="installment-total-row">
            <label>نسخ أوقات لجميع الأيام</label>
            <div class="installment-total-input-wrap schedule-copy">
              <div class="schedule-copy-row">
                <input v-model="copyFromTime" type="time" class="schedule-copy-input" />
                <span>—</span>
                <input v-model="copyToTime" type="time" class="schedule-copy-input" />
                <button type="button" class="btn btn-sm" @click="copyTimeToAll">تطبيق على الكل</button>
              </div>
              <p class="field-hint">يُطبّق الأوقات المحددة على كل الأيام المفعّلة</p>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg fee-settings-save-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M20 6 9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>حفظ</span>
          </button>
        </form>
      </section>

      <div v-if="toast.show" class="toast" :class="toast.type">{{ toast.message }}</div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { db } from '@/firebase/config'
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { settingsRepo, doctorProfilesRepo } from '@/services/clinic.js'

const authStore = useAuthStore()

const photoInput = ref(null)
const importInput = ref(null)

const currentView = ref('hub')
const toast = ref({ show: false, message: '', type: 'success' })

const savingInfo = ref(false)
const savingBilling = ref(false)
const changingPassword = ref(false)
const uploadingPhoto = ref(false)

const infoForm = ref({ doctorName: '', doctorBio: '', address: '', phone1: '', phone2: '', whatsapp: '', photoUrl: '' })
const billingSettings = ref({ consultationFee: 0, examFee: 0, reviewFee: 0, reviewDays: 3 })
const clinicHoursForm = ref({ openTime: '08:00', closeTime: '14:00', slotInterval: 20 })
const weeklySchedule = ref([
  { name: 'السبت', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الأحد', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الاثنين', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الثلاثاء', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الأربعاء', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الخميس', enabled: true, from: '08:00', to: '14:00' },
  { name: 'الجمعة', enabled: false, from: '08:00', to: '14:00' }
])
const copyFromTime = ref('08:00')
const copyToTime = ref('14:00')

function copyTimeToAll() {
  weeklySchedule.value.forEach(d => {
    if (d.enabled) {
      d.from = copyFromTime.value
      d.to = copyToTime.value
    }
  })
}
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const accountInfo = ref({ email: '', fullName: '' })
const publicProfile = ref({ is_public: false, specialty: '', doctor_bio: '', consultation_fee: 0, area: '', clinic_open_time: '', clinic_close_time: '', is_lab: false, is_hospital: false, offers: [], map_url: '' })
const savingPublicProfile = ref(false)

const initials = computed(() => {
  const name = infoForm.value.doctorName || authStore.fullName || ''
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
})

const publicProfileLink = computed(() => {
  if (!authStore.clinicId || !publicProfile.value.is_public) return ''
  return `${window.location.origin}/doctor/${authStore.clinicId}`
})

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3000)
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  uploadingPhoto.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, { method: 'POST', body: formData })
    const data = await res.json()
    if (data.success) {
      infoForm.value.photoUrl = data.data.url
      await updateDoc(doc(db, 'users', authStore.uid), { photoUrl: data.data.url })
      showToast('تم رفع الصورة بنجاح')
    } else {
      showToast('خطأ في رفع الصورة', 'error')
    }
  } catch (err) {
    showToast('خطأ في رفع الصورة', 'error')
  } finally {
    uploadingPhoto.value = false
  }
}

async function saveInfo() {
  if (!authStore.uid) { showToast('يجب تسجيل الدخول أولاً', 'error'); return }
  savingInfo.value = true
  try {
    await updateDoc(doc(db, 'users', authStore.uid), {
      fullName: infoForm.value.doctorName,
      doctorName: infoForm.value.doctorName,
      doctorBio: infoForm.value.doctorBio,
      photoUrl: infoForm.value.photoUrl
    })
    if (authStore.clinicId) {
      await updateDoc(doc(db, 'clinics', authStore.clinicId), {
        name: infoForm.value.doctorName || infoForm.value.clinicName,
        address: infoForm.value.address,
        phone: infoForm.value.phone1,
        phone2: infoForm.value.phone2
      })
      await settingsRepo.setDoctorInfo(authStore.clinicId, {
        doctor_name: infoForm.value.doctorName,
        doctor_bio: infoForm.value.doctorBio,
        clinic_name: infoForm.value.doctorName,
        clinic_address: infoForm.value.address,
        phone1: infoForm.value.phone1,
        phone2: infoForm.value.phone2,
        whatsapp: infoForm.value.whatsapp,
        photoUrl: infoForm.value.photoUrl
      })
    }
    showToast('تم حفظ المعلومات بنجاح')
  } catch (err) {
    console.error('saveInfo error:', err)
    showToast('خطأ في الحفظ', 'error')
  } finally {
    savingInfo.value = false
  }
}

async function saveBillingSettings() {
  if (!authStore.uid) { showToast('يجب تسجيل الدخول أولاً', 'error'); return }
  if (!authStore.clinicId) { showToast('لم يتم ربط حسابك بعيادة', 'error'); return }
  savingBilling.value = true
  try {
    await settingsRepo.setFeeSettings(authStore.clinicId, billingSettings.value.examFee, billingSettings.value.reviewFee)
    await settingsRepo.setGeneralSettings(authStore.clinicId, billingSettings.value.reviewDays)
    await settingsRepo.setDoctorInfo(authStore.clinicId, { consultation_fee: billingSettings.value.consultationFee || 0 })
    await updateDoc(doc(db, 'users', authStore.uid), {
      examFee: billingSettings.value.examFee || 0,
      reviewFee: billingSettings.value.reviewFee || 0,
      reviewDays: billingSettings.value.reviewDays || 0
    })
    showToast('تم حفظ إعدادات الفواتير')
  } catch (err) {
    showToast('خطأ في الحفظ', 'error')
  } finally {
    savingBilling.value = false
  }
}

async function saveClinicHours() {
  if (!authStore.clinicId) return
  try {
    const enabledDays = weeklySchedule.value.filter(d => d.enabled)
    const firstOpen = enabledDays.length ? enabledDays[0].from : '08:00'
    const lastClose = enabledDays.length ? enabledDays[enabledDays.length - 1].to : '14:00'
    await settingsRepo.setDoctorInfo(authStore.clinicId, {
      clinic_open_time: firstOpen,
      clinic_close_time: lastClose,
      slot_interval: clinicHoursForm.value.slotInterval || 20,
      weekly_schedule: JSON.parse(JSON.stringify(weeklySchedule.value))
    })
    await doctorProfilesRepo.save(authStore.clinicId, {
      weekly_schedule: JSON.parse(JSON.stringify(weeklySchedule.value)),
      clinic_open_time: firstOpen,
      clinic_close_time: lastClose
    })
    showToast('تم حفظ ساعات العيادة')
  } catch (e) { showToast('خطأ في الحفظ', 'error') }
}

async function savePublicProfile() {
  if (!authStore.clinicId) { showToast('لم يتم ربط حسابك بعيادة', 'error'); return }
  savingPublicProfile.value = true
  try {
    await doctorProfilesRepo.save(authStore.clinicId, {
      ...publicProfile.value,
      doctor_name: infoForm.value.doctorName || '',
      clinic_name: infoForm.value.doctorName || '',
      clinic_address: infoForm.value.address || '',
      phone1: infoForm.value.phone1 || '',
      phone2: infoForm.value.phone2 || '',
      whatsapp: infoForm.value.whatsapp || '',
      photoUrl: infoForm.value.photoUrl || ''
    })
    showToast('تم حفظ الملف العام')
  } catch (e) {
    console.error('savePublicProfile error:', e)
    showToast('خطأ في الحفظ', 'error')
  } finally {
    savingPublicProfile.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('كلمتا المرور غير متطابقتين', 'error')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    showToast('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error')
    return
  }
  changingPassword.value = true
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Not authenticated')
    const credential = EmailAuthProvider.credential(user.email, passwordForm.value.currentPassword)
    await reauthenticateWithCredential(user, credential)
    await updatePassword(user, passwordForm.value.newPassword)
    passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
    showToast('تم تغيير كلمة المرور بنجاح')
  } catch (err) {
    const msg = err.code === 'auth/wrong-password'
      ? 'كلمة المرور الحالية غير صحيحة'
      : 'خطأ في تغيير كلمة المرور'
    showToast(msg, 'error')
  } finally {
    changingPassword.value = false
  }
}

async function exportBackup() {
  try {
    const cid = authStore.clinicId
    const backupData = { exportDate: new Date().toISOString(), clinicId: cid, collections: {} }
    const collections = ['patients', 'appointments', 'diagnoses', 'prescriptions', 'expenses', 'installments', 'installment_payments', 'doctor_settings', 'general_settings', 'patient_reports', 'fee_settings']
    for (const col of collections) {
      const { collection, getDocs, query, where } = await import('firebase/firestore')
      const q = query(collection(db, col), where('clinicId', '==', cid))
      const snap = await getDocs(q)
      backupData.collections[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `madar-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('تم التصدير بنجاح')
  } catch (err) {
    showToast('خطأ في التصدير', 'error')
  }
}

async function importBackup(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (!data.collections) throw new Error('Invalid backup file')
    for (const [colName, docs] of Object.entries(data.collections)) {
      if (!Array.isArray(docs)) continue
      for (const docData of docs) {
        const { id, ...rest } = docData
        if (id) {
          await setDoc(doc(db, colName, id), rest)
        }
      }
    }
    showToast('تم استيراد البيانات بنجاح — يُنصح بإعادة تحميل الصفحة', 'success')
  } catch (err) {
    showToast('خطأ في الملف — تأكد من صحته', 'error')
  }
}

onMounted(async () => {
  try {
    const cid = authStore.clinicId
    const uid = authStore.uid
    accountInfo.value.email = authStore.email || ''
    accountInfo.value.fullName = authStore.fullName || ''

    const userSnap = await getDoc(doc(db, 'users', uid))
    if (userSnap.exists()) {
      const data = userSnap.data()
      infoForm.value = {
        doctorName: data.doctorName || data.fullName || '',
        doctorBio: data.doctorBio || '',
        address: '',
        phone1: '',
        phone2: '',
        whatsapp: '',
        photoUrl: data.photoUrl || ''
      }
      accountInfo.value.fullName = data.fullName || authStore.fullName || ''
      billingSettings.value = {
        examFee: data.examFee || 0,
        reviewFee: data.reviewFee || 0,
        reviewDays: data.reviewDays ?? 3
      }
    }

    if (cid) {
      const clinicSnap = await getDoc(doc(db, 'clinics', cid))
      if (clinicSnap.exists()) {
        const data = clinicSnap.data()
        infoForm.value.address = data.address || ''
        infoForm.value.phone1 = data.phone || ''
        infoForm.value.phone2 = data.phone2 || ''
        if (data.examFee !== undefined) billingSettings.value.examFee = data.examFee
        if (data.reviewFee !== undefined) billingSettings.value.reviewFee = data.reviewFee
        if (data.reviewDays !== undefined) billingSettings.value.reviewDays = data.reviewDays
      }

      try {
        const docInfo = await settingsRepo.getDoctorInfo(cid)
        if (docInfo) {
          if (docInfo.doctor_name && !infoForm.value.doctorName) infoForm.value.doctorName = docInfo.doctor_name
          if (docInfo.doctor_bio && !infoForm.value.doctorBio) infoForm.value.doctorBio = docInfo.doctor_bio
          if (docInfo.clinic_address && !infoForm.value.address) infoForm.value.address = docInfo.clinic_address
          if (docInfo.phone1 && !infoForm.value.phone1) infoForm.value.phone1 = docInfo.phone1
          if (docInfo.phone2 && !infoForm.value.phone2) infoForm.value.phone2 = docInfo.phone2
          if (docInfo.whatsapp && !infoForm.value.whatsapp) infoForm.value.whatsapp = docInfo.whatsapp
          if (docInfo.photoUrl && !infoForm.value.photoUrl) infoForm.value.photoUrl = docInfo.photoUrl
          if (docInfo.consultation_fee !== undefined) billingSettings.value.consultationFee = docInfo.consultation_fee
          if (docInfo.clinic_open_time) clinicHoursForm.value.openTime = docInfo.clinic_open_time
          if (docInfo.clinic_close_time) clinicHoursForm.value.closeTime = docInfo.clinic_close_time
          if (docInfo.slot_interval) clinicHoursForm.value.slotInterval = docInfo.slot_interval
          if (docInfo.weekly_schedule && docInfo.weekly_schedule.length) {
            weeklySchedule.value = docInfo.weekly_schedule
          }
        }
      } catch (e) {}

      try {
        const feeSettings = await settingsRepo.getFeeSettings(cid)
        if (feeSettings) {
          if (feeSettings.exam_fee) billingSettings.value.examFee = feeSettings.exam_fee
          if (feeSettings.review_fee) billingSettings.value.reviewFee = feeSettings.review_fee
        }
      } catch (e) {}

      try {
        const generalSettings = await settingsRepo.getGeneralSettings(cid)
        if (generalSettings && generalSettings.review_days !== undefined) {
          billingSettings.value.reviewDays = generalSettings.review_days
        }
      } catch (e) {}

      try {
        const profile = await doctorProfilesRepo.getByClinic(cid)
        if (profile) {
          publicProfile.value = {
            is_public: profile.is_public || false,
            specialty: profile.specialty || '',
            doctor_bio: profile.doctor_bio || '',
            consultation_fee: profile.consultation_fee || 0,
            area: profile.area || '',
            clinic_open_time: profile.clinic_open_time || '',
            clinic_close_time: profile.clinic_close_time || '',
            is_lab: profile.is_lab || false,
            is_hospital: profile.is_hospital || false,
            offers: profile.offers || [],
            map_url: profile.map_url || ''
          }
        }
      } catch (e) {}
    }
  } catch (err) {
    console.error('Settings load error:', err)
  }
})
</script>

<style scoped>
.settings-view-container { padding: 24px; max-width: 900px; margin: 0 auto; }
.view-header { margin-bottom: 24px; }
.view-title h2 { font-size: 1.6rem; font-weight: 800; color: var(--text, #1a1a2e); margin: 0; }
.view-title p { color: var(--text-muted, #6b7280); font-size: 0.85rem; margin: 4px 0 0; }
.view-title-with-back { display: flex; align-items: flex-start; gap: 12px; }
.back-btn { background: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.3); border-radius: 10px; padding: 8px; cursor: pointer; color: var(--text, #1a1a2e); transition: background 0.2s; flex-shrink: 0; margin-top: 2px; }
.back-btn:hover { background: rgba(255,255,255,0.9); }

.installment-card { background: rgba(255,255,255,0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.3); border-radius: 14px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
.installment-total-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }
.installment-total-row:last-of-type { border-bottom: none; }
.installment-total-row label { min-width: 180px; font-size: 0.85rem; font-weight: 600; color: var(--text, #1a1a2e); padding-top: 10px; flex-shrink: 0; }
.installment-total-input-wrap { flex: 1; }
.installment-total-input-wrap input,
.installment-total-input-wrap textarea { width: 100%; padding: 10px 14px; border: 1px solid var(--border, #e5e7eb); border-radius: 10px; font-size: 0.9rem; color: var(--text, #1a1a2e); background: var(--card, #fff); outline: none; transition: border-color 0.2s; font-family: inherit; }
.installment-total-input-wrap input:focus,
.installment-total-input-wrap textarea:focus { border-color: #1150c9; }
.input-disabled { background: #f1f5f9 !important; color: #94a3b8 !important; cursor: not-allowed !important; }
.fee-settings-save-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; }
.field-hint { font-size: 0.78rem; color: #64748b; margin-top: 6px; flex: 1; }

.photo-upload-row { display: flex; align-items: center; gap: 16px; }
.profile-photo-preview { width: 80px; height: 80px; border-radius: 50%; overflow: hidden; cursor: pointer; position: relative; flex-shrink: 0; border: 2px dashed rgba(17,80,201,0.3); transition: border-color 0.2s; }
.profile-photo-preview:hover { border-color: #1150c9; }
.profile-photo-preview img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }
.avatar-placeholder { width: 100%; height: 100%; background: linear-gradient(135deg, #1150c9, #0d9488); color: #fff; display: grid; place-items: center; font-size: 1.5rem; font-weight: 800; }
.avatar-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: #fff; opacity: 0; transition: opacity 0.2s; border-radius: 50%; }
.avatar-overlay span { font-size: 0.6rem; font-weight: 600; }
.profile-photo-preview:hover .avatar-overlay { opacity: 1; }
.photo-hint { font-size: 0.78rem; color: var(--text-muted, #6b7280); }

.account-sections { display: flex; flex-direction: column; gap: 20px; }
.account-section-title { font-size: 1rem; font-weight: 700; color: var(--text, #1a1a2e); border-bottom: 2px solid #d69e1f; padding-bottom: 8px; display: inline-block; margin-top: 8px; }

.toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; inset: 0; background: #cbd5e1; border-radius: 13px; transition: background 0.3s; }
.toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; right: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform 0.3s; }
.toggle-switch input:checked + .toggle-slider { background: #1150c9; }
.toggle-switch input:checked + .toggle-slider::before { transform: translateX(-22px); }

.public-profile-link { margin-top: 16px; padding: 14px; background: #f0fdf4; border-radius: 10px; border: 1px solid #bbf7d0; }
.public-profile-link p { font-size: 0.8rem; color: #166534; font-weight: 600; margin-bottom: 4px; }
.public-profile-link a { font-size: 0.82rem; color: #1150c9; word-break: break-all; text-decoration: none; font-weight: 600; }
.public-profile-link a:hover { text-decoration: underline; }

.schedule-list { display: flex; flex-direction: column; gap: 2px; margin-bottom: 16px; border: 1px solid var(--border, #e5e7eb); border-radius: 12px; overflow: hidden; }
.schedule-row { display: flex; align-items: center; gap: 16px; padding: 14px 16px; background: var(--card, #fff); border-bottom: 1px solid var(--border, #f1f5f9); }
.schedule-row:last-child { border-bottom: none; }
.schedule-day-info { display: flex; align-items: center; gap: 12px; min-width: 140px; }
.schedule-day-name { font-size: 0.9rem; font-weight: 600; color: var(--text-muted, #94a3b8); transition: color 0.2s; }
.schedule-day-name.active { color: var(--text, #1a1a2e); }
.schedule-times { display: flex; align-items: center; gap: 10px; flex: 1; }
.schedule-time-input { display: flex; align-items: center; gap: 6px; }
.schedule-time-input label { font-size: 0.75rem; color: var(--text-muted, #94a3b8); font-weight: 600; }
.schedule-time-input input[type="time"] { padding: 8px 12px; border: 1px solid var(--border, #e5e7eb); border-radius: 8px; font-size: 0.85rem; font-family: inherit; color: var(--text, #1a1a2e); background: var(--card, #fff); outline: none; direction: ltr; }
.schedule-time-input input[type="time"]:focus { border-color: #1150c9; }
.schedule-time-sep { color: var(--text-muted, #94a3b8); font-weight: 600; }
.schedule-off { color: var(--text-muted, #94a3b8); font-size: 0.85rem; font-weight: 600; font-style: italic; }
.schedule-copy { flex-direction: column; align-items: flex-start !important; }
.schedule-copy-row { display: flex; align-items: center; gap: 10px; }
.schedule-copy-input { padding: 8px 12px; border: 1px solid var(--border, #e5e7eb); border-radius: 8px; font-size: 0.85rem; font-family: inherit; color: var(--text, #1a1a2e); background: var(--card, #fff); outline: none; direction: ltr; width: 120px; }
.schedule-copy-input:focus { border-color: #1150c9; }
.btn-sm { padding: 8px 16px; border-radius: 8px; border: 1px solid #1150c9; background: #1150c9; color: #fff; font-size: 0.8rem; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
.btn-sm:active { background: #0e42a8; }

@media (max-width: 768px) {
  .schedule-row { flex-direction: column; align-items: flex-start; gap: 10px; }
  .schedule-day-info { min-width: auto; }
  .schedule-times { flex-wrap: wrap; }
  .schedule-copy-row { flex-wrap: wrap; }
}

.offers-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }

.fee-settings-save-btn { display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; }
.offer-item { display: flex; gap: 8px; align-items: center; }
.offer-input { flex: 1; padding: 10px 12px; border: 1px solid var(--border, #e5e7eb); border-radius: 8px; font-size: 0.85rem; font-family: inherit; color: var(--text, #1a1a2e); background: var(--card, #fff); outline: none; }
.offer-input:focus { border-color: #1150c9; }
.offer-remove { background: #fef2f2; border: none; border-radius: 8px; width: 36px; height: 36px; display: grid; place-items: center; cursor: pointer; color: #dc2626; flex-shrink: 0; transition: background 0.2s; }
.offer-remove:active { background: #fee2e2; }
.offer-add-btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; border: 1.5px dashed #d1d5db; background: transparent; color: #64748b; font-size: 0.82rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
.offer-add-btn:hover { border-color: #1150c9; color: #1150c9; background: #eff6ff; }

@keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 768px) {
  .settings-view-container { padding: 16px; }
  .installment-total-row { flex-direction: column; gap: 8px; }
  .installment-total-row label { min-width: auto; padding-top: 0; }
  .photo-upload-row { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 480px) {
  .installment-card { padding: 16px; }
  .backup-action-row { flex-direction: column; gap: 12px; align-items: flex-start; }
  .backup-action-row .btn { width: 100%; justify-content: center; }
}
</style>
