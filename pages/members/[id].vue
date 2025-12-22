<template>
  <div class="min-h-screen bg-gray-50 py-6 px-4">
    <div class="max-w-5xl mx-auto">

      <!-- HEADER -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">
          {{ formatMemberName(member) }}
        </h1>
        <p class="text-sm text-gray-500">
          Payment History
        </p>
      </div>

      <!-- TABLE CARD -->
      <div
        class="relative overflow-x-auto rounded-xl
               border border-gray-200 bg-white
               shadow-sm transition-all"
      >
        <table class="w-full text-sm text-left">
          <thead
            class="sticky top-0 z-10
                   bg-gray-100 text-xs uppercase
                   text-gray-600 border-b"
          >
            <tr>
              <th class="px-4 py-3">Date</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3 text-right">Amount</th>
              <th class="px-4 py-3">Receipt</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="p in payments"
              :key="p.id"
              class="border-b hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 whitespace-nowrap">
                {{ formatDate(p.created_at) }}
              </td>

              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center px-2 py-0.5
                         rounded-full text-xs font-medium
                         bg-blue-100 text-blue-700"
                >
                  {{ p.category || 'Other' }}
                </span>
              </td>

              <td class="px-4 py-3 text-right font-semibold text-gray-900">
                ₱{{ Number(p.amount).toLocaleString() }}
              </td>

              <td class="px-4 py-3 font-mono text-gray-600">
                {{ p.receipt_number }}
              </td>
            </tr>

            <!-- EMPTY STATE -->
            <tr v-if="!loading && payments.length === 0">
              <td
                colspan="4"
                class="px-6 py-10 text-center text-gray-500"
              >
                No payment records found
              </td>
            </tr>
          </tbody>
        </table>

        <!-- LOADING -->
        <div
          v-if="loading"
          class="p-6 text-center text-gray-500"
        >
          Loading payments…
        </div>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      member: {},
      payments: [],
      loading: true
    }
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString()
    },
    formatMemberName(m) {
  if (!m) return ''

  const last = m.last_name || ''
  const first = m.first_name || ''

  let middleInitial = ''
  if (m.middle_name) {
    middleInitial = m.middle_name.charAt(0).toUpperCase() + '.'
  }

  const suffix = m.suffix ? ` ${m.suffix}` : ''

  return `${last}, ${first}${middleInitial ? ' ' + middleInitial : ''}${suffix}`
}

  },

  async mounted() {
    const route = useRoute()
    const supabase = useSupabaseClient()
    const memberId = route.params.id

    // Fetch member (READ ONLY)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        first_name,
        middle_name,
        last_name,
        suffix
      `)
      .eq('id', memberId)
      .single()

    if (memberError) {
      console.error(memberError)
      return
    }

    // Fetch payments (READ ONLY)
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .select('id, amount, category, receipt_number, created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (paymentError) {
      console.error(paymentError)
      return
    }

    this.member = member
    this.payments = payments || []
    this.loading = false
  }
}
</script>
