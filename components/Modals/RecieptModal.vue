<template>
  <!-- OVERLAY -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-5xl bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Payment Records — {{ family.head_name }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ family.address }}
          </p>
        </div>
        <button @click="$emit('close')" class="text-xl text-gray-500">&times;</button>
      </div>

      <!-- BODY -->
      <div class="p-4 overflow-x-auto">
        <p v-if="loading" class="p-4 text-gray-500">
          Loading records...
        </p>

        <table v-else class="w-full text-sm text-left text-gray-700">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3">Member</th>
              <th class="px-6 py-3">Total Paid</th>
              <th class="px-6 py-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            <!-- MEMBER ROW -->
            <template v-for="m in members" :key="m.id">
              <tr class="border-b bg-gray-50">
                <td class="px-6 py-4 font-semibold">
                  {{ m.full_name }}
                </td>

                <td class="px-6 py-4">
                  ₱{{ totalPaid(m.payments) }}
                </td>

                <td class="px-6 py-4">
                  <button
                    @click="toggle(m.id)"
                    class="text-blue-600 hover:underline text-sm"
                  >
                    {{ expanded[m.id] ? 'Hide payments' : 'View payments' }}
                  </button>
                </td>
              </tr>

              <!-- PAYMENT ROWS (COLLAPSIBLE) -->
              <tr v-if="expanded[m.id]">
                <td colspan="3" class="px-6 pb-4">
                  <table class="w-full text-xs border rounded">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-4 py-2">Amount</th>
                        <th class="px-4 py-2">Category</th>
                        <th class="px-4 py-2">Date</th>
                        <th class="px-4 py-2">Receipt No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="p in m.payments"
                        :key="p.id"
                        class="border-t"
                      >
                        <td class="px-4 py-2">₱{{ p.amount }}</td>
                        <td class="px-4 py-2">{{ p.category }}</td>
                        <td class="px-4 py-2">
                          {{ new Date(p.created_at).toLocaleString() }}
                        </td>
                        <td class="px-4 py-2 font-mono">
                          {{ p.receipt_number }}
                        </td>
                      </tr>

                      <tr v-if="m.payments.length === 0">
                        <td colspan="4" class="px-4 py-3 text-center text-gray-500">
                          No payments yet
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>

            <tr v-if="members.length === 0">
              <td colspan="3" class="px-6 py-6 text-center text-gray-500">
                No members found
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: {
    family: { type: Object, required: true }
  },
  data() {
    return {
      members: [],
      expanded: {},   // reactive in Vue 3
      loading: true
    }
  },
  methods: {
    toggle(id) {
      this.expanded[id] = !this.expanded[id]
    },
    totalPaid(payments) {
      return payments
        .reduce((sum, p) => sum + Number(p.amount), 0)
        .toFixed(2)
    }
  },
  async mounted() {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
      .from('members')
      .select(`
        id,
        full_name,
        payments (
          id,
          amount,
          category,
          receipt_number,
          created_at
        )
      `)
      .eq('family_id', this.family.id)
      .order('full_name')

    if (error) {
      console.error(error)
    } else {
      this.members = data.map(m => ({
        ...m,
        payments: [...m.payments].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      }))
    }

    this.loading = false
  }
}
</script>

