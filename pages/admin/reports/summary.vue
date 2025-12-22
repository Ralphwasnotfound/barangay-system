<template>
  <div class="bg-gray-50 min-h-screen">
    <AdminSideBarPanel />

    <div class="p-4 sm:p-6 sm:ml-64 space-y-8">

      <!-- PAGE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
          <p class="text-sm text-gray-500">
            Summary and breakdown by Purok
          </p>
        </div>

        <NuxtLink
          to="/admin/reports/full"
          class="inline-flex items-center gap-2 text-sm font-medium
                 text-blue-600 hover:underline"
        >
          View Full Reports →
        </NuxtLink>
      </div>

      <!-- PERIOD FILTER -->
      <div class="flex flex-wrap gap-2">
        <button
          v-for="p in ['all','week','month','quarter']"
          :key="p"
          @click="setPeriod(p)"
          class="px-4 py-2 rounded-lg text-sm border transition"
          :class="selectedPeriod === p
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 hover:bg-gray-100'"
        >
          {{ p === 'all' ? 'All Time' : 'This ' + p.charAt(0).toUpperCase() + p.slice(1) }}
        </button>
      </div>

      <!-- PUROK LOOP -->
      <div
        v-for="purok in purokReports"
        :key="purok.purok"
        class="bg-white rounded-2xl border shadow-sm overflow-hidden"
      >

        <!-- PUROK HEADER -->
        <div class="px-5 py-4 border-b flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ purok.purok }}
          </h2>
        </div>

        <!-- SUMMARY -->
        <div class="px-5 py-4 bg-gray-50 border-b">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-sm">
            <div>
              <p class="text-gray-500">Families</p>
              <p class="text-lg font-semibold">{{ purok.summary.families }}</p>
            </div>

            <div>
              <p class="text-gray-500">Total Persons</p>
              <p class="text-lg font-semibold">{{ purok.summary.totalPersons }}</p>
            </div>

            <div>
              <p class="text-gray-500">Transactions</p>
              <p class="text-lg font-semibold text-green-600">
                {{ purok.summary.totalTransactions }}
              </p>
            </div>

            <div>
              <p class="text-gray-500">Total Collection</p>
              <p class="text-lg font-semibold">
                ₱{{ formatCurrency(purok.summary.totalCollection) }}
              </p>
            </div>
          </div>
        </div>

        <!-- TIME SUMMARY -->
        <div class="px-5 py-4 border-b">
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-sm">
            <div
              v-for="(value, key) in purok.timeSummary"
              :key="key"
              class="bg-gray-100 rounded-lg p-3"
            >
              <p class="text-gray-500 capitalize">{{ key }}</p>
              <p class="font-semibold">{{ value }}</p>
            </div>
          </div>
        </div>

        <!-- FAMILY TABLE -->
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm text-left text-gray-700">
            <thead class="bg-gray-100 text-xs uppercase">
              <tr>
                <th class="px-5 py-3">Head of Family</th>
                <th class="px-5 py-3 text-center">Members</th>
                <th class="px-5 py-3 text-center">Transactions</th>
                <th class="px-5 py-3 text-right">Total ₱</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="family in purok.families"
                :key="family.id"
                class="border-b hover:bg-gray-50"
              >
                <td class="px-5 py-3 font-medium">
                  {{ family.head }}
                </td>

                <td class="px-5 py-3 text-center">
                  {{ family.members }}
                </td>

                <td class="px-5 py-3 text-center text-green-600 font-semibold">
                  {{ family.transactionCount }}
                </td>

                <td class="px-5 py-3 text-right font-semibold">
                  ₱{{ formatCurrency(family.totalCollection) }}
                </td>
              </tr>

              <tr v-if="!purok.families.length">
                <td colspan="4" class="px-5 py-6 text-center text-gray-500">
                  No families found
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
      <!-- END PUROK -->
    </div>
  </div>
</template>



<script>
import AdminSideBarPanel from '~/components/Admin/AdminSideBarPanel.vue'
import { useSupabaseClient } from '#imports'

export default {
  components: { AdminSideBarPanel },

  data() {
    return {
      selectedPeriod: 'all',
      purokReports: []
    }
  },

  async mounted() {
    await this.loadAllPuroks()
  },

  methods: {
    /* ---------------- LOAD REPORT ---------------- */
    async loadAllPuroks() {
      const supabase = useSupabaseClient()

      const { data: families } = await supabase
        .from('families')
        .select('id, first_name, middle_name, last_name, suffix, purok')

      const { data: members } = await supabase
        .from('members')
        .select('family_id')

      const { data: payments } = await supabase
        .from('payments')
        .select('family_id, amount, created_at')

      const range = this.getDateRange()

      const filteredPayments = range
        ? payments.filter(p => {
            const d = new Date(p.created_at)
            return d >= range.start && d <= range.end
          })
        : payments

      /* ---------------- MEMBER COUNT ---------------- */
      const memberCount = {}
      members.forEach(m => {
        memberCount[m.family_id] =
          (memberCount[m.family_id] || 0) + 1
      })

      /* ---------------- INIT PUROK MAP ---------------- */
      const purokMap = {}

      families.forEach(f => {
        if (!f.purok) return

        if (!purokMap[f.purok]) {
          purokMap[f.purok] = {
            purok: f.purok,
            families: [],
            summary: {
              families: 0,
              totalPersons: 0,
              totalTransactions: 0,
              totalCollection: 0
            },
            timeSummary: {
              all: 0,
              today: 0,
              week: 0,
              month: 0,
              quarter: 0
            }
          }
        }
      })

      /* ---------------- TRANSACTION COUNT & TOTAL ---------------- */
      const transactionCount = {}
      const transactionTotal = {}

      filteredPayments.forEach(p => {
        const family = families.find(f => f.id === p.family_id)
        if (!family || !family.purok) return

        transactionCount[p.family_id] =
          (transactionCount[p.family_id] || 0) + 1

        transactionTotal[p.family_id] =
          (transactionTotal[p.family_id] || 0) + Number(p.amount)

        const purok = purokMap[family.purok]

        purok.timeSummary.all++
        if (this.isToday(p.created_at)) purok.timeSummary.today++
        if (this.isThisWeek(p.created_at)) purok.timeSummary.week++
        if (this.isThisMonth(p.created_at)) purok.timeSummary.month++
        if (this.isThisQuarter(p.created_at)) purok.timeSummary.quarter++
      })

      /* ---------------- BUILD FAMILY ROWS ---------------- */
      families.forEach(f => {
        if (!f.purok) return

        purokMap[f.purok].families.push({
          id: f.id,
          head: this.formatFullName(
            f.first_name,
            f.middle_name,
            f.last_name,
            f.suffix
          ),
          members: memberCount[f.id] || 0,
          transactionCount: transactionCount[f.id] || 0,
          totalCollection: transactionTotal[f.id] || 0
        })
      })

      /* ---------------- SORT FAMILIES A–Z ---------------- */
      Object.values(purokMap).forEach(p => {
        p.families.sort((a, b) => a.head.localeCompare(b.head))
      })

      /* ---------------- BUILD PUROK SUMMARY ---------------- */
      Object.values(purokMap).forEach(p => {
        p.summary.families = p.families.length

        p.summary.totalPersons =
          p.families.length +
          p.families.reduce((s, f) => s + f.members, 0)

        p.summary.totalTransactions =
          p.families.reduce((s, f) => s + f.transactionCount, 0)

        p.summary.totalCollection =
          p.families.reduce((s, f) => s + f.totalCollection, 0)
      })

      /* ---------------- SORT PUROKS (1 → 7) ---------------- */
      this.purokReports = Object.values(purokMap).sort((a, b) => {
        const getNum = (p) => {
          const match = p.purok.match(/\d+/)
          return match ? Number(match[0]) : 999
        }
        return getNum(a) - getNum(b)
      })
    },

    /* ---------------- HELPERS ---------------- */
    formatCurrency(value) {
      return Number(value || 0).toLocaleString()
    },

    formatFullName(first, middle, last, suffix) {
      const middleInitial = middle
        ? ` ${middle.trim().charAt(0).toUpperCase()}.`
        : ''

      const suffixPart = suffix
        ? `, ${suffix}`
        : ''

      return `${last}, ${first}${middleInitial}${suffixPart}`
    },

    isToday(date) {
      const d = new Date(date)
      const now = new Date()
      return d.toDateString() === now.toDateString()
    },

    isThisWeek(date) {
      const d = new Date(date)
      const now = new Date()
      const start = new Date(now)
      start.setDate(now.getDate() - now.getDay())
      return d >= start && d <= now
    },

    isThisMonth(date) {
      const d = new Date(date)
      const now = new Date()
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear()
    },

    isThisQuarter(date) {
      const d = new Date(date)
      const now = new Date()
      const q1 = Math.floor(now.getMonth() / 3)
      const q2 = Math.floor(d.getMonth() / 3)
      return q1 === q2 && d.getFullYear() === now.getFullYear()
    },

    setPeriod(period) {
      this.selectedPeriod = period
      this.loadAllPuroks()
    },

    getDateRange() {
      const now = new Date()

      if (this.selectedPeriod === 'week') {
        const start = new Date(now)
        start.setDate(now.getDate() - now.getDay())
        return { start, end: now }
      }

      if (this.selectedPeriod === 'month') {
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now
        }
      }

      if (this.selectedPeriod === 'quarter') {
        const q = Math.floor(now.getMonth() / 3) * 3
        return {
          start: new Date(now.getFullYear(), q, 1),
          end: now
        }
      }

      return null
    }
  }
}
</script>

