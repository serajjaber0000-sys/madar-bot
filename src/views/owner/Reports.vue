<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { incomeRepo, expensesRepo, appointmentsRepo } from '@/services/clinic'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

const auth = useAuthStore()
const clinicId = computed(() => auth.clinicId)

const reportType = ref('daily')
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedMonth = ref(
  `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
)
const selectedYear = ref(new Date().getFullYear())

const loading = ref(false)
const reportSummary = ref({ income: 0, expenses: 0, net: 0 })
const patientCount = ref(0)
const appointmentCount = ref(0)
const tableData = ref([])
const chartData = ref([])

const tabs = [
  { label: 'يومي', value: 'daily' },
  { label: 'شهري', value: 'monthly' },
  { label: 'سنوي', value: 'annual' }
]

const arabicMonths = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
]

const arabicDays = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت'
]

const currentYear = new Date().getFullYear()

const yearOptions = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 10; y--) years.push(y)
  return years
})

const stats = computed(() => [
  { label: 'إجمالي الإيرادات', value: reportSummary.value.income, color: '#21A8E0', iconText: 'إ' },
  { label: 'المصروفات', value: reportSummary.value.expenses, color: '#D81B8A', iconText: 'م' },
  { label: 'صافي الربح', value: reportSummary.value.net, color: '#10b981', iconText: 'ص' },
  { label: 'عدد المرضى', value: patientCount.value, color: '#8b5cf6', iconText: 'ع', isCount: true },
  { label: 'عدد الحجوزات', value: appointmentCount.value, color: '#f59e0b', iconText: 'ح', isCount: true }
])

const maxChartValue = computed(() => {
  if (!chartData.value.length) return 1
  let max = 0
  chartData.value.forEach(item => {
    if (item.income > max) max = item.income
    if (item.expenses > max) max = item.expenses
  })
  return max || 1
})

const hasData = computed(() => chartData.value.length > 0 || tableData.value.length > 0)

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US').format(Math.round(val)) + ' د.ع'
}

function formatNumber(val) {
  return new Intl.NumberFormat('en-US').format(val)
}

function formatDateArabic(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getDate()} ${arabicMonths[d.getMonth()]} ${d.getFullYear()}`
}

function getBarHeight(value, maxVal) {
  if (!maxVal || maxVal === 0) return 2
  return Math.max((value / maxVal) * 100, 2)
}

function getChartLabel(item) {
  if (reportType.value === 'daily') {
    const d = new Date(item.date)
    return arabicDays[d.getDay()]
  } else if (reportType.value === 'monthly') {
    const d = new Date(item.date)
    return d.getDate().toString()
  } else {
    if (item.month) return arabicMonths[item.month - 1] || String(item.month)
    if (item.date) return arabicMonths[new Date(item.date).getMonth()]
    return ''
  }
}

function getTableLabel(row) {
  if (reportType.value === 'annual') {
    if (row.month) return arabicMonths[row.month - 1] || String(row.month)
    if (row.date) return arabicMonths[new Date(row.date).getMonth()]
    return ''
  }
  return formatDateArabic(row.date)
}

async function fetchCountsForRange(startDate, endDate) {
  try {
    const patientsQ = query(
      collection(db, 'patients'),
      where('clinicId', '==', clinicId.value)
    )
    const patientsSnap = await getDocs(patientsQ)
    patientCount.value = patientsSnap.size

    const apptsQ = query(
      collection(db, 'appointments'),
      where('clinicId', '==', clinicId.value)
    )
    const apptsSnap = await getDocs(apptsQ)
    let count = 0
    apptsSnap.forEach(doc => {
      const data = doc.data()
      const apptDate = data.date || data.createdAt
      if (apptDate) {
        const d = typeof apptDate === 'string'
          ? apptDate
          : (apptDate.toDate ? apptDate.toDate().toISOString().split('T')[0] : '')
        if (d && d >= startDate && d <= endDate) count++
      }
    })
    appointmentCount.value = count
  } catch (e) {
    console.error('Error fetching counts:', e)
  }
}

async function fetchData() {
  if (!clinicId.value) return
  loading.value = true

  try {
    const cid = clinicId.value

    const apptsSnap = await getDocs(query(collection(db, 'appointments'), where('clinicId', '==', cid)))
    const allAppts = apptsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const expSnap = await getDocs(query(collection(db, 'expenses'), where('clinicId', '==', cid)))
    const allExpenses = expSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    const patientsSnap = await getDocs(query(collection(db, 'patients'), where('clinicId', '==', cid)))
    const allPatients = patientsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    function calcIncome(start, end) {
      return allAppts.filter(a => a.appointment_date >= start && a.appointment_date < end).reduce((sum, a) => {
        if (a.entered === 1 && a.consultation_fee) return sum + (Number(a.consultation_fee) || 0)
        if (a.payment_status === 'paid' || a.payment_status === 'review') return sum + (Number(a.amount) || 0)
        return sum
      }, 0)
    }
    function calcExpenses(start, end) {
      return allExpenses.filter(e => e.expense_date >= start && e.expense_date < end).reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    }
    function countAppts(start, end) {
      return allAppts.filter(a => a.appointment_date >= start && a.appointment_date < end).length
    }

    function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }

    function isoFromParts(y, m, d) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    if (reportType.value === 'daily') {
      const date = selectedDate.value
      const d = new Date(date)
      const y = d.getFullYear(), m = d.getMonth(), day = d.getDate()

      const dayStart = isoFromParts(y, m, day)
      const dayEnd = isoFromParts(y, m, day + 1)
      const dayIncome = calcIncome(dayStart, dayEnd)
      const dayExpenses = calcExpenses(dayStart, dayEnd)
      reportSummary.value = { income: dayIncome, expenses: dayExpenses, net: dayIncome - dayExpenses }

      const daysInMonth = getDaysInMonth(y, m)
      const monthDays = []
      for (let dd = 1; dd <= daysInMonth; dd++) {
        const ds = isoFromParts(y, m, dd)
        const de = isoFromParts(y, m, dd + 1)
        monthDays.push({ date: ds, income: calcIncome(ds, de), expenses: calcExpenses(ds, de), net: calcIncome(ds, de) - calcExpenses(ds, de) })
      }
      tableData.value = monthDays

      const dayOfWeek = d.getDay()
      const startOffset = (dayOfWeek - 6 + 7) % 7
      const weekStart = new Date(y, m, day - startOffset)
      const weekDays = []
      for (let i = 0; i < 7; i++) {
        const wd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i)
        const ws = isoFromParts(wd.getFullYear(), wd.getMonth(), wd.getDate())
        const we = isoFromParts(wd.getFullYear(), wd.getMonth(), wd.getDate() + 1)
        weekDays.push({ date: ws, income: calcIncome(ws, we), expenses: calcExpenses(ws, we), net: calcIncome(ws, we) - calcExpenses(ws, we) })
      }
      chartData.value = weekDays

      patientCount.value = allPatients.length
      appointmentCount.value = countAppts(dayStart, dayEnd)

    } else if (reportType.value === 'monthly') {
      const [year, month] = selectedMonth.value.split('-').map(Number)
      const mIdx = month - 1

      const mStart = isoFromParts(year, mIdx, 1)
      const mEnd = isoFromParts(year, mIdx + 1, 1)
      const mIncome = calcIncome(mStart, mEnd)
      const mExpenses = calcExpenses(mStart, mEnd)
      reportSummary.value = { income: mIncome, expenses: mExpenses, net: mIncome - mExpenses }

      const daysInMonth = getDaysInMonth(year, mIdx)
      const monthDays = []
      for (let dd = 1; dd <= daysInMonth; dd++) {
        const ds = isoFromParts(year, mIdx, dd)
        const de = isoFromParts(year, mIdx, dd + 1)
        monthDays.push({ date: ds, income: calcIncome(ds, de), expenses: calcExpenses(ds, de), net: calcIncome(ds, de) - calcExpenses(ds, de) })
      }
      chartData.value = monthDays
      tableData.value = monthDays

      patientCount.value = allPatients.length
      appointmentCount.value = countAppts(mStart, mEnd)

    } else if (reportType.value === 'annual') {
      const year = selectedYear.value
      const aStart = isoFromParts(year, 0, 1)
      const aEnd = isoFromParts(year + 1, 0, 1)
      const aIncome = calcIncome(aStart, aEnd)
      const aExpenses = calcExpenses(aStart, aEnd)
      reportSummary.value = { income: aIncome, expenses: aExpenses, net: aIncome - aExpenses }

      const months = []
      for (let mm = 0; mm < 12; mm++) {
        const ms = isoFromParts(year, mm, 1)
        const me = isoFromParts(year, mm + 1, 1)
        const inc = calcIncome(ms, me)
        const exp = calcExpenses(ms, me)
        months.push({ month: mm + 1, date: ms, income: inc, expenses: exp, net: inc - exp })
      }
      chartData.value = months
      tableData.value = months

      patientCount.value = allPatients.length
      appointmentCount.value = countAppts(aStart, aEnd)
    }
  } catch (error) {
    console.error('Error fetching report:', error)
  } finally {
    loading.value = false
  }
}

function printReport() {
  window.print()
}

watch([reportType, selectedDate, selectedMonth, selectedYear], () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<template>
  <AppLayout>
    <div class="reports-page">

      <div class="print-header">
        <h1>تقرير العيادة</h1>
        <p>{{ reportType === 'daily' ? 'تقرير يومي' : reportType === 'monthly' ? 'تقرير شهري' : 'تقرير سنوي' }}</p>
        <p>{{ new Date().toLocaleDateString('ar-IQ') }}</p>
      </div>

      <div class="page-header no-print">
        <div>
          <h1 class="page-title">التقارير</h1>
          <p class="page-subtitle">عرض التقارير المالية والإحصائيات</p>
        </div>
        <button class="print-btn" @click="printReport">طباعة التقرير</button>
      </div>

      <div class="tabs no-print">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="tab-btn"
          :class="{ active: reportType === tab.value }"
          @click="reportType = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="date-picker-section no-print">
        <div class="date-picker-wrapper">
          <label class="date-label">الفترة:</label>
          <input
            v-if="reportType === 'daily'"
            type="date"
            v-model="selectedDate"
            class="date-input"
          />
          <input
            v-else-if="reportType === 'monthly'"
            type="month"
            v-model="selectedMonth"
            class="date-input"
          />
          <select
            v-else
            v-model="selectedYear"
            class="date-input year-select"
          >
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p class="loading-text">جاري تحميل البيانات...</p>
      </div>

      <div v-else class="report-content">

        <div class="stats-grid">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
            :style="{ borderTopColor: stat.color }"
          >
            <div class="stat-icon" :style="{ background: stat.color + '15', color: stat.color }">
              {{ stat.iconText }}
            </div>
            <div class="stat-info">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value" :style="{ color: stat.color }">
                {{ stat.isCount ? formatNumber(stat.value) : formatCurrency(stat.value) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="chartData.length" class="chart-card">
          <h3 class="card-title">المخطط البياني</h3>
          <div class="bar-chart">
            <div class="chart-bars">
              <div
                v-for="(item, index) in chartData"
                :key="index"
                class="bar-group"
              >
                <div class="bars-wrapper">
                  <div
                    class="bar income-bar"
                    :style="{ height: getBarHeight(item.income, maxChartValue) + '%' }"
                    :title="'الإيرادات: ' + formatCurrency(item.income || 0)"
                  ></div>
                  <div
                    class="bar expense-bar"
                    :style="{ height: getBarHeight(item.expenses, maxChartValue) + '%' }"
                    :title="'المصروفات: ' + formatCurrency(item.expenses || 0)"
                  ></div>
                </div>
                <span class="bar-label">{{ getChartLabel(item) }}</span>
              </div>
            </div>
            <div class="chart-legend">
              <span class="legend-item">
                <span class="legend-dot" style="background: #21A8E0"></span>
                الإيرادات
              </span>
              <span class="legend-item">
                <span class="legend-dot" style="background: #D81B8A"></span>
                المصروفات
              </span>
            </div>
          </div>
        </div>

        <div v-if="tableData.length" class="table-card">
          <h3 class="card-title">
            {{ reportType === 'annual' ? 'التفصيل الشهري' : 'التفصيل اليومي' }}
          </h3>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{{ reportType === 'annual' ? 'الشهر' : 'التاريخ' }}</th>
                  <th>الإيرادات</th>
                  <th>المصروفات</th>
                  <th>صافي الربح</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in tableData" :key="idx">
                  <td>{{ idx + 1 }}</td>
                  <td>{{ getTableLabel(row) }}</td>
                  <td class="income-cell">{{ formatCurrency(row.income || 0) }}</td>
                  <td class="expense-cell">{{ formatCurrency(row.expenses || 0) }}</td>
                  <td :class="(row.net || 0) >= 0 ? 'profit-cell' : 'loss-cell'">
                    {{ formatCurrency(row.net || 0) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td colspan="2"><strong>الإجمالي</strong></td>
                  <td class="income-cell"><strong>{{ formatCurrency(reportSummary.income) }}</strong></td>
                  <td class="expense-cell"><strong>{{ formatCurrency(reportSummary.expenses) }}</strong></td>
                  <td :class="reportSummary.net >= 0 ? 'profit-cell' : 'loss-cell'">
                    <strong>{{ formatCurrency(reportSummary.net) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div v-if="!hasData" class="empty-state">
          <div class="empty-circle"><span>--</span></div>
          <h3>لا توجد بيانات</h3>
          <p>لم يتم العثور على بيانات لهذه الفترة</p>
        </div>

      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.reports-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  background: #F5F5F7;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;
}

.print-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: #21A8E0;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.print-btn:hover {
  background: #1a8bc0;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(33, 168, 224, 0.35);
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: white;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s;
  background: transparent;
  color: #6b7280;
  font-family: inherit;
}

.tab-btn.active {
  background: #21A8E0;
  color: white;
  box-shadow: 0 4px 12px rgba(33, 168, 224, 0.3);
}

.tab-btn:not(.active):hover {
  background: #f0f4f8;
  color: #1a1a2e;
}

.date-picker-section {
  margin-bottom: 24px;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.date-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.date-input {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  background: white;
}

.date-input:focus {
  border-color: #21A8E0;
}

.year-select {
  min-width: 160px;
  cursor: pointer;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #21A8E0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 16px;
  color: #6b7280;
  font-size: 14px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-top: 4px solid transparent;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 800;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  white-space: nowrap;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  direction: ltr;
  text-align: right;
}

.chart-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 24px;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 240px;
  padding: 0 8px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bars-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  width: 100%;
  height: calc(100% - 28px);
}

.bar {
  flex: 1;
  min-height: 4px;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
}

.bar:hover {
  opacity: 0.8;
}

.income-bar {
  background: linear-gradient(to top, #21A8E0, #60c5f7);
}

.expense-bar {
  background: linear-gradient(to top, #D81B8A, #f472b6);
}

.bar-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 8px;
  text-align: center;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 28px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex-shrink: 0;
}

.table-card {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  min-width: 500px;
}

.data-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: right;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #374151;
  white-space: nowrap;
}

.data-table tbody tr {
  transition: background 0.15s;
}

.data-table tbody tr:hover {
  background: #f8fafc;
}

.income-cell {
  color: #21A8E0;
  font-weight: 600;
  direction: ltr;
  text-align: right;
}

.expense-cell {
  color: #D81B8A;
  font-weight: 600;
  direction: ltr;
  text-align: right;
}

.profit-cell {
  color: #10b981;
  font-weight: 600;
  direction: ltr;
  text-align: right;
}

.loss-cell {
  color: #ef4444;
  font-weight: 600;
  direction: ltr;
  text-align: right;
}

.total-row {
  background: #f8fafc;
}

.total-row td {
  border-top: 2px solid #e5e7eb;
  border-bottom: none;
  padding: 14px 16px;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.empty-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-circle span {
  font-size: 28px;
  font-weight: 700;
  color: #9ca3af;
}

.empty-state h3 {
  font-size: 18px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state p {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}

.print-header {
  display: none;
}

@media print {
  .no-print {
    display: none !important;
  }

  .print-header {
    display: block;
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 2px solid #1a1a2e;
  }

  .print-header h1 {
    font-size: 26px;
    color: #1a1a2e;
    margin: 0 0 8px;
  }

  .print-header p {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0;
  }

  .reports-page {
    padding: 0;
    max-width: 100%;
    background: white;
    min-height: auto;
  }

  .stat-card,
  .chart-card,
  .table-card {
    box-shadow: none;
    border: 1px solid #e5e7eb;
    break-inside: avoid;
  }

  .stat-card:hover {
    transform: none;
    box-shadow: none;
  }

  .stats-grid {
    grid-template-columns: repeat(5, 1fr);
  }

  .bar {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .legend-dot {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  body {
    background: white;
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .reports-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .print-btn {
    justify-content: center;
  }

  .tabs {
    flex-direction: column;
    gap: 4px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
    font-size: 17px;
    border-radius: 12px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-value {
    font-size: 16px;
  }

  .chart-bars {
    height: 180px;
  }

  .bar-label {
    font-size: 9px;
  }

  .chart-card,
  .table-card {
    padding: 20px;
  }

  .date-picker-wrapper {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 18px;
  }

  .chart-bars {
    height: 150px;
    gap: 4px;
  }

  .chart-legend {
    gap: 16px;
    font-size: 12px;
  }

  .data-table {
    font-size: 13px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 12px;
  }
}
</style>
