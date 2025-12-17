<template>
  <div class="max-w-5xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-1">
      {{ member.full_name }}
    </h1>

    <p class="text-gray-500 mb-6">
      Payment History
    </p>

    <div class="overflow-x-auto bg-white border rounded shadow-sm">
      <table class="w-full text-sm text-left">
        <thead class="bg-gray-100 border-b">
          <tr>
            <th class="px-4 py-3">Date</th>
            <th class="px-4 py-3">Category</th>
            <th class="px-4 py-3">Amount</th>
            <th class="px-4 py-3">Receipt</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="p in payments"
            :key="p.id"
            class="border-b"
          >
            <td class="px-4 py-3">
              {{ formatDate(p.created_at) }}
            </td>
            <td class="px-4 py-3">
              {{ p.category }}
            </td>
            <td class="px-4 py-3">
              ₱{{ p.amount }}
            </td>
            <td class="px-4 py-3 font-mono">
              {{ p.receipt_number }}
            </td>
          </tr>

          <tr v-if="!loading && payments.length === 0">
            <td colspan="4" class="px-4 py-6 text-center text-gray-500">
              No payment records found
            </td>
          </tr>
        </tbody>
      </table>

      <p v-if="loading" class="p-4 text-gray-500">
        Loading payments...
      </p>
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
    }
  },

  async mounted() {
    const route = useRoute()
    const supabase = useSupabaseClient()
    const memberId = route.params.id

    // Fetch member (READ ONLY)
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, full_name')
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
