<template>
  <div class="arabic-date-picker" @click.stop>
    <div class="picker-header">
      <button class="nav-btn" @click="prevMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
      </button>
      <button class="title-btn" @click="toggleYearMode">
        {{ currentYear }}
      </button>
      <button class="month-label" @click="toggleYearMode">
        {{ arMonthNames[currentMonth] }}
      </button>
      <button class="title-btn" @click="toggleYearMode">
      </button>
      <button class="nav-btn" @click="nextMonth">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="14 9 20 14 14 19"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></svg>
      </button>
    </div>

    <template v-if="!yearMode">
      <div class="weekday-row">
        <span v-for="wd in arWeekdays" :key="wd" class="weekday">{{ wd }}</span>
      </div>
      <div class="days-grid">
        <span v-for="(d, i) in daysGrid" :key="i" class="spacer" v-if="!d"></span>
        <button
          v-else
          :class="['day-btn', { today: d === todayDay && currentMonth === todayMonth && currentYear === todayYear, selected: selectedDay === d && currentMonth === selectedMonth && currentYear === selectedYear }]"
          @click="selectDay(d)"
        >{{ d }}</button>
      </div>
    </template>

    <template v-else>
      <div class="year-grid">
        <button
          v-for="y in yearRange"
          :key="y"
          :class="['year-btn', { selected: y === currentYear }]"
          @click="selectYear(y)"
        >{{ y }}</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])

const arMonthNames = [
  'جانفيـر', 'فبريـر', 'مارس', 'أبريـل', 'مايـو', 'يونيـو',
  'جويليـة', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديcemبر'
]
const arWeekdays = ['س', 'م', 'ث', 'ر', 'خ', 'ج', 'س']

const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())
const selectedMonth = ref(-1)
const selectedYear = ref(-1)
const selectedDay = ref(-1)
const yearMode = ref(false)

const todayDay = now.getDate()
const todayMonth = now.getMonth()
const todayYear = now.getFullYear()

if (props.modelValue) {
  const [y, m, d] = props.modelValue.split('-').map(Number)
  currentMonth.value = m - 1
  currentYear.value = y
  selectedMonth.value = m - 1
  selectedYear.value = y
  selectedDay.value = d
}

const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfWeek = computed(() => {
  return (new Date(currentYear.value, currentMonth.value, 1).getDay() + 1) % 7
})

const daysGrid = computed(() => {
  const grid = []
  for (let i = 0; i < firstDayOfWeek.value; i++) grid.push(0)
  for (let d = 1; d <= daysInMonth.value; d++) grid.push(d)
  return grid
})

const yearRange = computed(() => {
  const years = []
  for (let y = currentYear.value - 5; y <= currentYear.value + 5; y++) years.push(y)
  return years
})

function prevMonth() {
  if (currentMonth.value === 0) { currentMonth.value = 11; currentYear.value-- }
  else currentMonth.value--
}
function nextMonth() {
  if (currentMonth.value === 11) { currentMonth.value = 0; currentYear.value++ }
  else currentMonth.value++
}
function selectDay(d) {
  selectedDay.value = d
  selectedMonth.value = currentMonth.value
  selectedYear.value = currentYear.value
  const mm = String(currentMonth.value + 1).padStart(2, '0')
  const dd = String(d).padStart(2, '0')
  emit('update:modelValue', `${currentYear.value}-${mm}-${dd}`)
}
function toggleYearMode() { yearMode.value = !yearMode.value }
function selectYear(y) {
  currentYear.value = y
  yearMode.value = false
}

function handleClickOutside(e) {
  const el = document.querySelector('.arabic-date-picker')
  if (el && !el.contains(e.target)) {
    emit('update:modelValue', props.modelValue)
  }
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.arabic-date-picker {
  position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 100;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.15); padding: 14px; min-width: 300px;
}
.picker-header { display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 12px; }
.nav-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: rgba(17,80,201,0.08); color: #1150c9; display: grid; place-items: center;
  cursor: pointer; transition: all 0.2s;
}
.nav-btn:hover { background: rgba(17,80,201,0.15); }
.title-btn {
  background: none; border: none; font-size: 0.9rem; font-weight: 700;
  color: #1e293b; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  font-family: inherit;
}
.title-btn:hover { background: rgba(0,0,0,0.04); }
.month-label {
  background: none; border: none; font-size: 0.9rem; font-weight: 700;
  color: #1150c9; cursor: pointer; padding: 4px 8px; border-radius: 6px;
  font-family: inherit;
}
.month-label:hover { background: rgba(17,80,201,0.08); }
.weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-bottom: 6px; }
.weekday { text-align: center; font-size: 0.75rem; font-weight: 600; color: #94a3b8; padding: 4px; }
.days-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
.spacer { visibility: hidden; }
.day-btn {
  width: 100%; aspect-ratio: 1; border: none; border-radius: 8px;
  background: none; font-size: 0.85rem; font-weight: 600; color: #1e293b;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.day-btn:hover { background: rgba(17,80,201,0.08); }
.day-btn.today { background: rgba(245,158,11,0.15); color: #92400e; }
.day-btn.selected { background: #1150c9; color: #fff; box-shadow: 0 2px 8px rgba(17,80,201,0.3); }
.year-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; max-height: 200px; overflow-y: auto; }
.year-btn {
  padding: 10px; border: 1px solid rgba(0,0,0,0.06); border-radius: 8px;
  background: none; font-size: 0.85rem; font-weight: 600; color: #1e293b;
  cursor: pointer; transition: all 0.15s; font-family: inherit;
}
.year-btn:hover { background: rgba(17,80,201,0.08); }
.year-btn.selected { background: #1150c9; color: #fff; }
</style>
