<template>
  <div class="bg-gray-50 min-h-screen">
    <AdminSideBarPanel />

    <div class="p-4 sm:p-6 sm:ml-64 space-y-8">

      <!-- PAGE HEADER -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500">
          Barangay overview & transaction analytics
        </p>
      </div>

      <!-- 🔹 QUICK STATS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div class="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
          <div class="p-3 rounded-xl bg-blue-100 text-blue-600">
            👥
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Persons</p>
            <p class="text-3xl font-bold text-gray-900">{{ totalPersons }}</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4">
          <div class="p-3 rounded-xl bg-green-100 text-green-600">
            🧾
          </div>
          <div>
            <p class="text-sm text-gray-500">Total Transactions</p>
            <p class="text-3xl font-bold text-gray-900">{{ totalTransactions }}</p>
          </div>
        </div>

      </div>

      <!-- 🔹 COLLECTION SUMMARY -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div class="bg-white rounded-2xl border shadow-sm p-5">
          <p class="text-sm text-gray-500">Today</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatMoney(todayTotal) }}
          </p>
        </div>

        <div class="bg-white rounded-2xl border shadow-sm p-5">
          <p class="text-sm text-gray-500">This Week</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatMoney(weekTotal) }}
          </p>
        </div>

        <div class="bg-white rounded-2xl border shadow-sm p-5">
          <p class="text-sm text-gray-500">This Month</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatMoney(monthTotal) }}
          </p>
        </div>

        <div class="bg-white rounded-2xl border shadow-sm p-5">
          <p class="text-sm text-gray-500">This Quarter</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ formatMoney(quarterTotal) }}
          </p>
        </div>

      </div>

      <!-- 🔹 TRANSACTIONS BY CATEGORY -->
      <div class="bg-white rounded-2xl border shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            Transactions by Category
          </h2>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="c in categoryCounts"
            :key="c.category"
            class="rounded-xl border p-4 text-center hover:shadow transition"
          >
            <p class="text-sm text-gray-500 truncate">
              {{ c.category }}
            </p>
            <p class="text-2xl font-bold text-gray-900">
              {{ c.count }}
            </p>
          </div>
        </div>
      </div>

      <!-- 🔹 CHART -->
      <div class="bg-white rounded-2xl border shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">
          Monthly Transactions Overview
        </h2>

        <MonthlyPaymentsChart
          :labels="['Jan', 'Feb', 'Mar', 'Apr']"
          :values="[12, 34, 28, 41]"
        />
      </div>

    </div>
  </div>
</template>


<script>
import { useSupabaseClient } from '#imports'
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue'
import MonthlyPaymentsChart from '~/components/Admin/MonthlyPaymentsChart.vue'

export default {
  components: {
    AdminSideBarPanel,
    MonthlyPaymentsChart
  },

  data() {
    return {
      totalPersons: 0,
      totalTransactions: 0,

      todayTotal: 0,
      weekTotal: 0,
      monthTotal: 0,
      quarterTotal: 0,

      categoryCounts: []
    }
  },

  async mounted() {
    const supabase = useSupabaseClient()

    /* ===============================
       TOTAL PERSONS
    =============================== */
    const families = await supabase
      .from('families')
      .select('*', { count: 'exact', head: true })

    const members = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })

    this.totalPersons = (families.count || 0) + (members.count || 0)

    /* ===============================
       TOTAL TRANSACTIONS (COUNT)
    =============================== */
    const paymentsCount = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })

    this.totalTransactions = paymentsCount.count || 0

    /* ===============================
       COLLECTION TOTALS
    =============================== */
    const now = new Date()

    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const startOfQuarter = new Date(
      now.getFullYear(),
      Math.floor(now.getMonth() / 3) * 3,
      1
    )

    const today = await this.sumPaymentsSince(supabase, startOfDay)
const week = await this.sumPaymentsSince(supabase, startOfWeek)
const month = await this.sumPaymentsSince(supabase, startOfMonth)
const quarter = await this.sumPaymentsSince(supabase, startOfQuarter)

this.todayTotal = today
this.weekTotal = week
this.monthTotal = month
this.quarterTotal = quarter


    /* ===============================
       CATEGORY COUNTS
    =============================== */
    const { data } = await supabase
      .from('payments')
      .select('category')

    const map = {}
    data.forEach(p => {
      const key = p.category || 'Other'
      map[key] = (map[key] || 0) + 1
    })

    this.categoryCounts = Object.entries(map).map(([category, count]) => ({
      category,
      count
    }))
  },

  methods: {
async sumPaymentsSince(supabase, startDate) {
  const start = startDate.toISOString().split('T')[0]
  const end = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('payments')
    .select('amount')
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) {
    console.error('Sum error:', error)
    return 0
  }

  if (!Array.isArray(data)) return 0

  return data.reduce((sum, p) => sum + Number(p.amount || 0), 0)
},



    formatMoney(value) {
      return '₱' + Number(value || 0).toLocaleString()
    }
  }
}
</script>

<style scoped>
</style>
