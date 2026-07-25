<template>
  <AppLayout>

      <!-- VIEW 0: HUB -->
      <section v-if="view === 0" class="view active">
        <header class="view-header">
          <div class="view-title">
            <h2>الفواتير</h2>
            <p>الأقساط، المدفوعات، والمصروفات</p>
          </div>
        </header>
        <div class="billing-hub">
          <button class="billing-hub-btn billing-hub-blue" @click="goToView1">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2.5"/><path d="M1 10h22" stroke-linecap="round"/></svg>
            <span>أقساط</span>
          </button>
          <button class="billing-hub-btn billing-hub-gold" @click="goToView3">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M15 9.5c0-1.4-1.4-2.5-3-2.5s-3 1-3 2.3c0 1.3 1.2 1.9 3 2.2 1.8.3 3 .9 3 2.2 0 1.3-1.4 2.3-3 2.3s-3-1.1-3-2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 5.5v1.5M12 17v1.5" stroke-linecap="round"/></svg>
            <span>مدفوعات اليوم</span>
          </button>
          <button class="billing-hub-btn billing-hub-red" @click="goToView4">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M8 12h8" stroke-linecap="round"/></svg>
            <span>المصروفات</span>
          </button>
          <button class="billing-hub-btn billing-hub-teal" @click="goToView5">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/><path d="M8 15h3M13 15h3" stroke-linecap="round"/></svg>
            <span>تقرير أسبوعي</span>
          </button>
          <button class="billing-hub-btn billing-hub-purple" @click="goToView6">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 17V9M13 17V5M8 17v-3" stroke-linecap="round"/></svg>
            <span>تقرير شهري</span>
          </button>
          <button class="billing-hub-btn billing-hub-green" @click="goToView7">
            <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke-linecap="round"/><path d="M8 15h1M12 15h1M16 15h1M8 18h1M12 18h1" stroke-linecap="round"/></svg>
            <span>تقرير سنوي</span>
          </button>
        </div>
      </section>

      <!-- VIEW 1: INSTALLMENTS PATIENTS LIST -->
      <section v-if="view === 1" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>الأقساط</h2>
              <p>مرضى الأقساط الذين أضافهم الدكتور فقط</p>
            </div>
          </div>
          <div class="view-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
              <input v-model="installmentSearch" type="text" placeholder="بحث بالاسم أو رقم الهاتف أو رقم الملف..." @input="searchInstallmentPatients" />
            </div>
            <button class="btn btn-primary btn-lg" @click="showAddPatientModal = true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
              <span>إضافة مريض</span>
            </button>
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
                  <th class="col-book">الأقساط</th>
                  <th class="col-flag">إزالة</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in installmentPatients" :key="p.id">
                  <td class="col-seq" style="text-align:center">{{ idx + 1 }}</td>
                  <td class="cell-name">{{ p.full_name }}</td>
                  <td class="cell-muted">{{ p.phone || '—' }}</td>
                  <td style="text-align:center">
                    <button class="btn-table btn-table-book" @click="openInstallmentDetail(p)">عرض</button>
                  </td>
                  <td style="text-align:center">
                    <button class="btn-table btn-table-report" @click="removeInstallmentPatient(p)">إزالة</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="installmentPatients.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="7" r="4"/></svg>
            <p>لم يُضَف أي مريض إلى الأقساط بعد. اضغط "إضافة مريض" لبدء إضافة مريض.</p>
          </div>
        </div>
      </section>

      <!-- VIEW 2: INSTALLMENT DETAIL -->
      <section v-if="view === 2" class="view active">
        <header class="view-header no-print">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 1" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>{{ selectedPatient?.full_name }}</h2>
              <p>تفاصيل الأقساط</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="btn btn-gold btn-lg" @click="printInstallment">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9V2h12v7" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke-linecap="round" stroke-linejoin="round"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>طباعة</span>
            </button>
          </div>
        </header>
        <div class="table-card installment-card no-print">
          <div class="installment-total-row">
            <label>المبلغ الكلي (دينار عراقي)</label>
            <div class="installment-total-input-wrap">
              <input v-model.number="installmentTotalInput" type="number" min="0" step="0.01" placeholder="0" />
              <button class="btn btn-primary" @click="saveInstallmentTotal">حفظ</button>
            </div>
          </div>
          <div class="installment-list">
            <div v-for="(pay, idx) in installmentPayments" :key="pay.id" class="installment-row">
              <span class="installment-row-label">قسط {{ idx + 1 }}</span>
              <span class="installment-row-amount">{{ formatAmount(pay.amount) }} د.ع</span>
              <span class="installment-row-date">{{ formatDate(pay.payment_date) }}</span>
              <button class="icon-btn delete" title="حذف" @click="deleteInstallmentPayment(pay)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <button class="btn btn-ghost installment-add-btn" @click="showAddPaymentModal = true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
            <span>إضافة قسط</span>
          </button>
          <div class="installment-remaining-box">
            <span class="installment-remaining-label">المتبقي</span>
            <span class="installment-remaining-value">{{ formatAmount(remainingAmount) }}</span>
          </div>
        </div>
      </section>

      <!-- VIEW 3: TODAY'S PAYMENTS -->
      <section v-if="view === 3" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>مدفوعات اليوم</h2>
              <p>إجمالي ما دخل إلى العيادة اليوم</p>
            </div>
          </div>
          <div class="view-actions">
            <div class="queue-launcher-group">
              <button class="icon-btn queue-date-arrow" title="عرض مدفوعات تاريخ آخر" @click="changeTodayDate(-1)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <span style="font-weight:800">{{ formatDate(todayPaymentsDate) }}</span>
              <button class="icon-btn queue-date-arrow" title="التالي" @click="changeTodayDate(1)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </header>
        <div class="billing-stats-bar">
          <div class="billing-stat income">
            <span class="billing-stat-label">مدفوعات اليوم</span>
            <span class="billing-stat-value">{{ formatAmount(todayIncome) }}</span>
          </div>
          <div class="billing-stat expense">
            <span class="billing-stat-label">مصروفات اليوم</span>
            <span class="billing-stat-value">{{ formatAmount(todayExpenses) }}</span>
          </div>
          <div class="billing-stat net">
            <span class="billing-stat-label">المبلغ النهائي</span>
            <span class="billing-stat-value">{{ formatAmount(todayNet) }}</span>
          </div>
        </div>
      </section>

      <!-- VIEW 4: EXPENSES -->
      <section v-if="view === 4" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>المصروفات</h2>
              <p>مصروفات اليوم</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="btn btn-primary btn-lg" @click="showAddExpenseModal = true">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>
              <span>إضافة</span>
            </button>
            <div class="queue-launcher-group">
              <button class="icon-btn queue-date-arrow" @click="changeExpenseDate(-1)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
              <span style="font-weight:800">{{ formatDate(expenseDate) }}</span>
              <button class="icon-btn queue-date-arrow" @click="changeExpenseDate(1)">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>
          </div>
        </header>
        <div class="table-card installment-card">
          <div class="installment-list">
            <div v-for="exp in expenses" :key="exp.id" class="installment-row">
              <span class="installment-row-label">{{ exp.description || 'مصروف' }}</span>
              <span class="installment-row-amount">{{ formatAmount(exp.amount) }} د.ع</span>
              <span class="installment-row-date">{{ formatDate(exp.expense_date) }}</span>
              <button class="icon-btn delete" title="حذف" @click="deleteExpense(exp)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
          <div v-if="expenses.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8" stroke-linecap="round"/></svg>
            <p>لا توجد مصروفات مسجّلة لهذا اليوم.</p>
          </div>
          <div class="installment-remaining-box">
            <span class="installment-remaining-label">إجمالي مصروفات اليوم</span>
            <span class="installment-remaining-value">{{ formatAmount(expensesTotal) }}</span>
          </div>
        </div>
      </section>

      <!-- VIEW 5: WEEKLY REPORT -->
      <section v-if="view === 5" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>تقرير أسبوعي</h2>
              <p>{{ weekStartDate }} - {{ weekEndDate }}</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="icon-btn" title="الأسبوع السابق" @click="changeWeek(-1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn" title="الأسبوع التالي" @click="changeWeek(1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </header>
        <div class="billing-stats-bar">
          <div class="billing-stat income"><span class="billing-stat-label">مدفوعات الأسبوع</span><span class="billing-stat-value">{{ formatAmount(weeklyTotalIncome) }}</span></div>
          <div class="billing-stat expense"><span class="billing-stat-label">مصروفات الأسبوع</span><span class="billing-stat-value">{{ formatAmount(weeklyTotalExpenses) }}</span></div>
          <div class="billing-stat net"><span class="billing-stat-label">المبلغ الصافي</span><span class="billing-stat-value">{{ formatAmount(weeklyNet) }}</span></div>
        </div>
        <div class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead><tr><th>اليوم</th><th>التاريخ</th><th>مدفوعات</th><th>مصروفات</th><th>الصافي</th></tr></thead>
              <tbody>
                <tr v-for="row in weeklyBreakdown" :key="row.date">
                  <td>{{ row.dayName }}</td>
                  <td class="date-value">{{ row.dateFormatted }}</td>
                  <td>{{ formatAmount(row.income) }} د.ع</td>
                  <td>{{ formatAmount(row.expenses) }} د.ع</td>
                  <td :style="{ color: row.net >= 0 ? '#16a34a' : 'var(--red-600)', fontWeight: 900 }">{{ formatAmount(row.net) }} د.ع</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- VIEW 6: MONTHLY REPORT -->
      <section v-if="view === 6" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>تقرير شهري</h2>
              <p>{{ monthYearLabel }}</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="icon-btn" title="الشهر السابق" @click="changeMonth(-1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn" title="الشهر التالي" @click="changeMonth(1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </header>
        <div class="billing-stats-bar">
          <div class="billing-stat income"><span class="billing-stat-label">مدفوعات الشهر</span><span class="billing-stat-value">{{ formatAmount(monthlyTotalIncome) }}</span></div>
          <div class="billing-stat expense"><span class="billing-stat-label">مصروفات الشهر</span><span class="billing-stat-value">{{ formatAmount(monthlyTotalExpenses) }}</span></div>
          <div class="billing-stat net"><span class="billing-stat-label">المبلغ الصافي</span><span class="billing-stat-value">{{ formatAmount(monthlyNet) }}</span></div>
        </div>
        <div class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead><tr><th>اليوم</th><th>التاريخ</th><th>مدفوعات</th><th>مصروفات</th><th>الصافي</th></tr></thead>
              <tbody>
                <tr v-for="row in monthlyBreakdown" :key="row.date">
                  <td>{{ row.dayName }}</td>
                  <td class="date-value">{{ row.dateFormatted }}</td>
                  <td>{{ formatAmount(row.income) }} د.ع</td>
                  <td>{{ formatAmount(row.expenses) }} د.ع</td>
                  <td :style="{ color: row.net >= 0 ? '#16a34a' : 'var(--red-600)', fontWeight: 900 }">{{ formatAmount(row.net) }} د.ع</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- VIEW 7: ANNUAL REPORT -->
      <section v-if="view === 7" class="view active">
        <header class="view-header">
          <div class="view-title view-title-with-back">
            <button class="icon-btn back-btn" @click="view = 0" title="رجوع">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div>
              <h2>تقرير سنوي</h2>
              <p>{{ annualYear }}</p>
            </div>
          </div>
          <div class="view-actions">
            <button class="icon-btn" title="السنة السابقة" @click="changeYear(-1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="icon-btn" title="السنة التالية" @click="changeYear(1)">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </header>
        <div class="billing-stats-bar">
          <div class="billing-stat income"><span class="billing-stat-label">مدفوعات السنة</span><span class="billing-stat-value">{{ formatAmount(annualTotalIncome) }}</span></div>
          <div class="billing-stat expense"><span class="billing-stat-label">مصروفات السنة</span><span class="billing-stat-value">{{ formatAmount(annualTotalExpenses) }}</span></div>
          <div class="billing-stat net"><span class="billing-stat-label">المبلغ الصافي</span><span class="billing-stat-value">{{ formatAmount(annualNet) }}</span></div>
        </div>
        <div class="table-card">
          <div class="table-wrap">
            <table class="patients-table">
              <thead><tr><th>الشهر</th><th>مدفوعات</th><th>مصروفات</th><th>الصافي</th></tr></thead>
              <tbody>
                <tr v-for="row in annualBreakdown" :key="row.month">
                  <td>{{ row.monthName }}</td>
                  <td>{{ formatAmount(row.income) }} د.ع</td>
                  <td>{{ formatAmount(row.expenses) }} د.ع</td>
                  <td :style="{ color: row.net >= 0 ? '#16a34a' : 'var(--red-600)', fontWeight: 900 }">{{ formatAmount(row.net) }} د.ع</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- MODAL: Add Patient to Installments -->
      <div v-if="showAddPatientModal" class="modal-overlay" @click.self="showAddPatientModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>إضافة مريض للأقساط</h2>
            <button class="icon-btn" @click="showAddPatientModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label>بحث عن مريض</label>
              <div class="search-box">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
                <input v-model="addPatientSearch" type="text" placeholder="بحث بالاسم أو رقم الهاتف..." @input="searchPatientsForEnroll" />
              </div>
            </div>
            <div v-if="searchResultsForEnroll.length" class="search-results">
              <div v-for="patient in searchResultsForEnroll" :key="patient.id" class="search-result-item" @click="enrollPatient(patient)">
                <span>{{ patient.full_name }}</span>
                <span class="cell-muted">{{ patient.phone || '' }}</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showAddPatientModal = false">إغلاق</button>
          </div>
        </div>
      </div>

      <!-- MODAL: Add Payment -->
      <div v-if="showAddPaymentModal" class="modal-overlay" @click.self="showAddPaymentModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>إضافة قسط</h2>
            <button class="icon-btn" @click="showAddPaymentModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-field">
              <label>مبلغ القسط</label>
              <input v-model.number="newPaymentAmount" type="number" min="0" step="0.01" placeholder="أدخل مبلغ القسط" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showAddPaymentModal = false">إلغاء</button>
            <button class="btn btn-primary" @click="addInstallmentPayment">تأكيد</button>
          </div>
        </div>
      </div>

      <!-- MODAL: Add Expense -->
      <div v-if="showAddExpenseModal" class="modal-overlay" @click.self="showAddExpenseModal = false">
        <div class="modal">
          <div class="modal-header">
            <h2>إضافة مصروف</h2>
            <button class="icon-btn" @click="showAddExpenseModal = false">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-field">
                <label>وصف المصروف</label>
                <input v-model="newExpenseDescription" type="text" placeholder="وصف المصروف..." />
              </div>
              <div class="form-field">
                <label>المبلغ</label>
                <input v-model.number="newExpenseAmount" type="number" min="0" step="0.01" placeholder="المبلغ" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showAddExpenseModal = false">إلغاء</button>
            <button class="btn btn-primary" @click="addExpense">تأكيد</button>
          </div>
        </div>
      </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { db } from '../../firebase/config'
import { collection, query, where, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore'
import { installmentsRepo } from '../../services/clinic.js'

const auth = useAuthStore()
const clinicId = computed(() => auth.clinicId)

const view = ref(0)
const installmentSearch = ref('')
const installmentPatients = ref([])
const showAddPatientModal = ref(false)
const addPatientSearch = ref('')
const searchResultsForEnroll = ref([])
const selectedPatient = ref(null)
const installmentTotalInput = ref(0)
const installmentPayments = ref([])
const showAddPaymentModal = ref(false)
const newPaymentAmount = ref(0)
const todayPaymentsDate = ref(new Date().toISOString().slice(0, 10))
const expenseDate = ref(new Date().toISOString().slice(0, 10))
const showAddExpenseModal = ref(false)
const newExpenseDescription = ref('')
const newExpenseAmount = ref(0)
const weekReferenceIso = ref(getMonday(new Date()).toISOString().slice(0, 10))
const reportYear = ref(new Date().getFullYear())
const reportMonth = ref(new Date().getMonth() + 1)
const annualYear = ref(new Date().getFullYear())

const allExpenses = ref([])
const allAppointments = ref([])

let unsubExpenses = null
let unsubAppointments = null

function getMonday(d) { const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); date.setDate(diff); return date }
function formatAmount(val) { if (val == null || isNaN(val)) return '0'; return Number(val).toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) }
function formatDate(dateStr) { if (!dateStr) return '—'; const [y,m,d] = dateStr.split('-'); return `${d}/${m}/${y}` }
function toISODate(d) { return new Date(d).toISOString().slice(0, 10) }
function addDays(dateStr, days) { const d = new Date(dateStr); d.setDate(d.getDate() + days); return toISODate(d) }
const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
const monthNames = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول']
function getDayName(dateStr) { return dayNames[new Date(dateStr).getDay()] }

function calcIncome(appointment) {
  const dt = appointment
  if (dt.entered === 1 && dt.consultation_fee) return Number(dt.consultation_fee) || 0
  if (dt.payment_status === 'paid' || dt.payment_status === 'review') return Number(dt.amount) || 0
  return 0
}

function expensesForDate(date) {
  return allExpenses.value.filter(e => e.expense_date === date)
}

function incomeForDate(date) {
  return allAppointments.value.filter(a => a.appointment_date === date).reduce((s, a) => s + calcIncome(a), 0)
}

function expensesForRange(start, end) {
  return allExpenses.value.filter(e => e.expense_date >= start && e.expense_date < end).reduce((s, e) => s + (Number(e.amount) || 0), 0)
}

function incomeForRange(start, end) {
  return allAppointments.value.filter(a => a.appointment_date >= start && a.appointment_date < end).reduce((s, a) => s + calcIncome(a), 0)
}

const todayIncome = computed(() => incomeForDate(todayPaymentsDate.value))
const todayExpenses = computed(() => expensesForDate(todayPaymentsDate.value).reduce((s, e) => s + (Number(e.amount) || 0), 0))
const todayNet = computed(() => todayIncome.value - todayExpenses.value)

const expenses = computed(() => allExpenses.value.filter(e => e.expense_date === expenseDate.value))
const expensesTotal = computed(() => expenses.value.reduce((s, e) => s + (e.amount || 0), 0))

const weekStartDate = computed(() => formatDate(weekReferenceIso.value))
const weekEndDate = computed(() => formatDate(addDays(weekReferenceIso.value, 6)))
const weeklyTotalIncome = computed(() => incomeForRange(weekReferenceIso.value, addDays(weekReferenceIso.value, 7)))
const weeklyTotalExpenses = computed(() => expensesForRange(weekReferenceIso.value, addDays(weekReferenceIso.value, 7)))
const weeklyNet = computed(() => weeklyTotalIncome.value - weeklyTotalExpenses.value)
const weeklyBreakdown = computed(() => {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = addDays(weekReferenceIso.value, i)
    const inc = incomeForDate(d)
    const exp = expensesForDate(d).reduce((s, e) => s + (Number(e.amount) || 0), 0)
    days.push({ date: d, dayName: getDayName(d), dateFormatted: formatDate(d), income: inc, expenses: exp, net: inc - exp })
  }
  return days
})

const monthYearLabel = computed(() => `${monthNames[reportMonth.value - 1]} ${reportYear.value}`)
const monthlyStartIso = computed(() => { const d = new Date(reportYear.value, reportMonth.value - 1, 1); return toISODate(d) })
const monthlyEndIso = computed(() => { const d = new Date(reportYear.value, reportMonth.value, 1); return toISODate(d) })
const monthlyTotalIncome = computed(() => incomeForRange(monthlyStartIso.value, monthlyEndIso.value))
const monthlyTotalExpenses = computed(() => expensesForRange(monthlyStartIso.value, monthlyEndIso.value))
const monthlyNet = computed(() => monthlyTotalIncome.value - monthlyTotalExpenses.value)
const monthlyBreakdown = computed(() => {
  const days = []
  const start = new Date(reportYear.value, reportMonth.value - 1, 1)
  const end = new Date(reportYear.value, reportMonth.value, 0)
  for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
    const d = toISODate(dt)
    const inc = incomeForDate(d)
    const exp = expensesForDate(d).reduce((s, e) => s + (Number(e.amount) || 0), 0)
    days.push({ date: d, dayName: getDayName(d), dateFormatted: formatDate(d), income: inc, expenses: exp, net: inc - exp })
  }
  return days
})

const annualTotalIncome = computed(() => incomeForRange(`${annualYear.value}-01-01`, `${annualYear.value + 1}-01-01`))
const annualTotalExpenses = computed(() => expensesForRange(`${annualYear.value}-01-01`, `${annualYear.value + 1}-01-01`))
const annualNet = computed(() => annualTotalIncome.value - annualTotalExpenses.value)
const annualBreakdown = computed(() => {
  return monthNames.map((name, i) => {
    const start = `${annualYear.value}-${String(i + 1).padStart(2, '0')}-01`
    const nextMonth = i < 11 ? `${annualYear.value}-${String(i + 2).padStart(2, '0')}-01` : `${annualYear.value + 1}-01-01`
    const inc = incomeForRange(start, nextMonth)
    const exp = expensesForRange(start, nextMonth)
    return { month: i + 1, monthName: name, income: inc, expenses: exp, net: inc - exp }
  })
})

const remainingAmount = computed(() => { const paid = installmentPayments.value.reduce((s, p) => s + (p.amount || 0), 0); return Math.max(0, (installmentTotalInput.value || 0) - paid) })

function goToView1() { view.value = 1; loadInstallmentPatients() }
function goToView3() { view.value = 3 }
function goToView4() { view.value = 4 }
function goToView5() { view.value = 5 }
function goToView6() { view.value = 6 }
function goToView7() { view.value = 7 }

function changeTodayDate(delta) { todayPaymentsDate.value = addDays(todayPaymentsDate.value, delta) }
function changeExpenseDate(delta) { expenseDate.value = addDays(expenseDate.value, delta) }
function changeWeek(delta) { weekReferenceIso.value = addDays(weekReferenceIso.value, delta * 7) }
function changeMonth(delta) { reportMonth.value += delta; if (reportMonth.value > 12) { reportMonth.value = 1; reportYear.value++ } else if (reportMonth.value < 1) { reportMonth.value = 12; reportYear.value-- } }
function changeYear(delta) { annualYear.value += delta }

async function loadInstallmentPatients() { try { installmentPatients.value = await installmentsRepo.listPatientsForBilling(clinicId.value, installmentSearch.value) } catch(e) { installmentPatients.value = [] } }
let searchTimeout = null
function searchInstallmentPatients() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => loadInstallmentPatients(), 300) }
async function searchPatientsForEnroll() { try { searchResultsForEnroll.value = await installmentsRepo.listPatientsForBilling(clinicId.value, addPatientSearch.value) } catch(e) { searchResultsForEnroll.value = [] } }
async function enrollPatient(patient) { try { await installmentsRepo.enroll(clinicId.value, patient.id); showAddPatientModal.value = false; addPatientSearch.value = ''; searchResultsForEnroll.value = []; await loadInstallmentPatients() } catch(e) { console.error(e) } }
async function removeInstallmentPatient(patient) { if (!confirm('إزالة ' + patient.full_name + ' من الأقساط؟')) return; try { await installmentsRepo.unenroll(patient.id); await loadInstallmentPatients() } catch(e) { console.error(e) } }

async function openInstallmentDetail(patient) { selectedPatient.value = patient; view.value = 2; try { const data = await installmentsRepo.getByPatient(patient.id); if (data) { installmentTotalInput.value = data.total_amount || 0; installmentPayments.value = data.payments || [] } else { installmentTotalInput.value = 0; installmentPayments.value = [] } } catch(e) { installmentTotalInput.value = 0; installmentPayments.value = [] } }
async function saveInstallmentTotal() { try { await installmentsRepo.setTotal(selectedPatient.value.id, installmentTotalInput.value) } catch(e) { console.error(e) } }
async function addInstallmentPayment() { if (!newPaymentAmount.value || newPaymentAmount.value <= 0) return; try { await installmentsRepo.addPayment(clinicId.value, selectedPatient.value.id, newPaymentAmount.value); showAddPaymentModal.value = false; newPaymentAmount.value = 0; await openInstallmentDetail(selectedPatient.value) } catch(e) { console.error(e) } }
async function deleteInstallmentPayment(pay) { if (!confirm('حذف هذا القسط؟')) return; try { await installmentsRepo.deletePayment(pay.installment_id, selectedPatient.value.id, pay.id); await openInstallmentDetail(selectedPatient.value) } catch(e) { console.error(e) } }
function printInstallment() { window.print() }

async function addExpense() { if (!newExpenseAmount.value || newExpenseAmount.value <= 0) return; try { await addDoc(collection(db, 'expenses'), { clinicId: clinicId.value, amount: Number(newExpenseAmount.value) || 0, description: newExpenseDescription.value || 'مصروف', expense_date: expenseDate.value, created_at: new Date().toISOString() }); showAddExpenseModal.value = false; newExpenseDescription.value = ''; newExpenseAmount.value = 0 } catch(e) { console.error(e) } }
async function deleteExpense(exp) { if (!confirm('حذف هذا المصروف؟')) return; try { await deleteDoc(doc(db, 'expenses', exp.id)) } catch(e) { console.error(e) } }

onMounted(() => {
  if (!clinicId.value) return

  unsubExpenses = onSnapshot(
    query(collection(db, 'expenses'), where('clinicId', '==', clinicId.value)),
    snap => { allExpenses.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) },
    err => { console.error('Expenses listener error:', err) }
  )

  unsubAppointments = onSnapshot(
    query(collection(db, 'appointments'), where('clinicId', '==', clinicId.value)),
    snap => { allAppointments.value = snap.docs.map(d => ({ id: d.id, ...d.data() })) },
    err => { console.error('Appointments listener error:', err) }
  )
})

onUnmounted(() => {
  if (unsubExpenses) unsubExpenses()
  if (unsubAppointments) unsubAppointments()
})
</script>

<style scoped>
.billing-stats-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
.billing-stat { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 18px 16px; text-align: center; position: relative; overflow: hidden; }
.billing-stat::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
.billing-stat.income::before { background: #10b981; }
.billing-stat.expense::before { background: #ef4444; }
.billing-stat.net::before { background: #1150c9; }
.billing-stat-label { display: block; font-size: 0.72rem; color: #64748b; font-weight: 600; margin-bottom: 6px; }
.billing-stat-value { display: block; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
.billing-stat.income .billing-stat-value { color: #10b981; }
.billing-stat.expense .billing-stat-value { color: #ef4444; }
.billing-stat.net .billing-stat-value { color: #1150c9; }
.billing-stat.net { background: #eff6ff; border-color: #bfdbfe; }
.billing-stat.net .billing-stat-label { color: #1150c9; font-weight: 700; }

.installment-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 20px; }
.installment-total-row { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
.installment-total-row:last-child { border-bottom: none; }
.installment-total-row label { min-width: 200px; font-size: 0.85rem; font-weight: 600; color: #1e293b; flex-shrink: 0; }
.installment-total-input-wrap { flex: 1; display: flex; gap: 10px; align-items: center; }
.installment-total-input-wrap input { flex: 1; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; color: #1e293b; outline: none; font-family: inherit; }
.installment-total-input-wrap input:focus { border-color: #1150c9; }
.installment-list { display: flex; flex-direction: column; gap: 8px; margin: 16px 0; }
.installment-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; }
.installment-row-label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
.installment-row-amount { font-size: 0.9rem; font-weight: 800; color: #10b981; }
.installment-row-date { font-size: 0.78rem; color: #94a3b8; }
.installment-add-btn { display: inline-flex; align-items: center; gap: 8px; margin: 12px 0; }
.installment-remaining-box { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; margin-top: 16px; }
.installment-remaining-label { font-size: 0.85rem; font-weight: 600; color: #1150c9; }
.installment-remaining-value { font-size: 1.4rem; font-weight: 800; color: #1150c9; }

.table-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
.table-wrap { overflow-x: auto; }
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 60px 24px; color: #94a3b8; }
.empty-state p { font-size: 0.9rem; margin: 0; text-align: center; }

.queue-launcher-group { display: flex; align-items: center; gap: 12px; }
.icon-btn { background: none; border: none; color: #64748b; cursor: pointer; padding: 4px; border-radius: 8px; display: grid; place-items: center; }
.icon-btn:hover { background: #f1f5f9; color: #1150c9; }
.icon-btn.delete:hover { color: #ef4444; }
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
.btn-table-report { color: #ef4444; }
.btn-table-report:hover { background: #fef2f2; border-color: #ef4444; }
.cell-name { font-weight: 700; color: #1e293b; }
.cell-muted { color: #64748b; font-size: 0.82rem; }

.modal { background: #fff; border-radius: 20px; width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #f1f5f9; }
.modal-header h2 { font-size: 1rem; font-weight: 700; color: #1e293b; margin: 0; }
.modal-body { padding: 20px 24px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 24px; border-top: 1px solid #f1f5f9; }
.form-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.form-field label { font-size: 0.8rem; font-weight: 600; color: #374151; margin-bottom: 4px; }
.form-field input { width: 100%; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 0.88rem; font-family: inherit; color: #1e293b; outline: none; transition: border-color 0.2s; }
.form-field input:focus { border-color: #1150c9; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.search-results { max-height: 200px; overflow-y: auto; margin-top: 12px; }
.search-result-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: background 0.15s; margin-bottom: 6px; }
.search-result-item:hover { background: #f0fdfa; border-color: #0d9488; }

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
.date-value { font-size: 0.78rem; color: #94a3b8; }

@media (max-width: 768px) {
  .billing-stats-bar { grid-template-columns: repeat(2, 1fr); }
  .billing-stat-value { font-size: 1.2rem; }
  .view-header { flex-direction: column; align-items: flex-start; gap: 12px; }
  .view-actions { width: 100%; }
  .search-box { width: 100%; }
  .installment-total-row { flex-direction: column; align-items: stretch; gap: 8px; }
  .installment-total-row label { min-width: auto; }
  .installment-remaining-value { font-size: 1.1rem; }
}
@media (max-width: 480px) {
  .billing-stats-bar { grid-template-columns: 1fr; }
  .view-actions { flex-direction: column; }
  .view-actions .btn { width: 100%; justify-content: center; }
  .installment-row { flex-wrap: wrap; gap: 6px; }
  .installment-remaining-box { flex-direction: column; gap: 8px; text-align: center; }
  .form-grid { grid-template-columns: 1fr; }
  .queue-launcher-group { width: 100%; justify-content: center; }
}
</style>
