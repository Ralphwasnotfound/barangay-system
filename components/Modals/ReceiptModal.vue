<template>
  <!-- OVERLAY -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-5xl bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Payment Records — {{ formatPersonName(family) }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ family.address }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>

      <!-- BODY -->
      <div class="p-4 overflow-x-auto">
        <p v-if="loading" class="p-4 text-gray-500">
          Loading members...
        </p>

        <table
          v-else
          class="w-full text-sm text-left text-gray-700"
        >
          <!-- HEADER -->
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3">Member</th>
              <th class="px-6 py-3">Total Paid</th>
              <th class="px-6 py-3">Full Details</th>
              <th
                v-if="!readonly"
                class="px-6 py-3"
              >
                Action
              </th>
            </tr>
          </thead>
        
          <!-- BODY -->
          <tbody>
            <template v-for="m in members" :key="m.id">
            
              <!-- ✅ MEMBER WITH PAYMENTS -->
              <tr
                v-for="p in m.payments"
                :key="p.id"
                class="border-b hover:bg-gray-50 transition"
              >
                <!-- MEMBER NAME -->
                <td class="px-6 py-4 font-medium text-gray-900">
                  {{ formatMemberName(m)}}
                
                  <!-- ADMIN ONLY -->
                  <template v-if="!readonly">
                    <button
                      @click.stop="openEditMember(m)"
                      class="ml-2 text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                  
                    <span
                      v-if="m.payments.length > 0"
                      class="ml-2 text-gray-400 text-xs"
                    >
                      
                    </span>
                  </template>
                </td>
              
                <!-- TOTAL PAID -->
                <td class="px-6 py-4">
                  ₱{{ totalPaid(m.payments) }}
                </td>
              
                <!-- LINK -->
                <td class="px-6 py-4">
                  <NuxtLink
                    :to="`/members/${m.id}`"
                    class="text-blue-600 hover:underline text-sm"
                    @click="$emit('close')"
                  >
                    View full history →
                  </NuxtLink>
                </td>
              
                <!-- ACTIONS (ADMIN ONLY) -->
                <td
                  v-if="!readonly"
                  class="px-3 py-2 text-right space-x-2"
                >
                  <button
                    @click.stop="openEditPayment(p)"
                    class="text-blue-600 hover:underline text-xs"
                  >
                    Edit
                  </button>
                
                  <button
                    @click.stop="confirmDeletePayment(p)"
                    class="text-red-600 hover:underline text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            
              <!-- ✅ MEMBER WITH NO PAYMENTS -->
              <tr
                v-if="m.payments.length === 0"
                class="border-b hover:bg-gray-50 transition"
              >
                <!-- MEMBER NAME -->
                <td class="px-6 py-4 font-medium text-gray-900">
                  {{ formatMemberName(m) }}
                
                  <!-- ADMIN ONLY -->
                  <template v-if="!readonly">
                    <button
                      @click.stop="openEditMember(m)"
                      class="ml-2 text-blue-600 hover:underline text-xs"
                    >
                      Edit
                    </button>
                  
                    <button
                      @click.stop="confirmDeleteMember(m)"
                      class="ml-2 text-red-600 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </template>
                </td>
              
                <!-- TOTAL -->
                <td class="px-6 py-4 text-gray-400 italic">
                  ₱0.00
                </td>
              
                <!-- INFO -->
                <td class="px-6 py-4 text-gray-400 italic">
                  No payments yet
                </td>
              
                <!-- EMPTY ACTION COLUMN (ADMIN ONLY) -->
                <td
                  v-if="!readonly"
                  class="px-6 py-4 text-right text-gray-400"
                >
                  —
                </td>
              </tr>
            
            </template>
          
            <!-- EMPTY STATE -->
            <tr v-if="members.length === 0">
              <td
                :colspan="readonly ? 3 : 4"
                class="px-6 py-6 text-center text-gray-500"
              >
                No members found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <EditPaymentModal
    v-if="showEditPaymentModal"
    :payment="selectedPayment"
    @close="showEditPaymentModal = false"
    @saved="handlePaymentUpdated"
    />

    <DeleteModal
    v-if="showDeleteConfirm"
    title="Delete Payment"
    message="Are you sure you want to delete this payment?"
    @confirm="deletePayment"
    @cancel="showDeleteConfirm = false"
    />

    <DeleteModal
    v-if="showDeleteMemberConfirm"
    title="Delete Member"
    message="Are you sure you want to delete this member? This action cannot be undone."
    @confirm="deleteMember"
    @cancel="showDeleteMemberConfirm = false"
    />

    <EditMemberModal
    v-if="showEditMemberModal"
    :member="selectedMember"
    @close="showEditMemberModal = false"
    @saved="handleMemberUpdated"
    />
  </div>
</template>

<script>
import EditPaymentModal from './EditPaymentModal.vue';
import DeleteModal from './DeleteModal.vue';
import EditMemberModal from './EditMemberModal.vue';

export default {
  components: {
    EditPaymentModal,
    DeleteModal,
    EditMemberModal
  },
  props: {
    family: {
      type: Object,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      members: [],
      loading: true,
      showEditPaymentModal: false,
      selectedPayment: null,
      showDeleteConfirm: false,

      showEditMemberModal: false,
      selectedMember: null,

      showDeleteMemberConfirm: false

    }
  },
  methods: {
    totalPaid(payments = []) {
      return payments
        .reduce((sum, p) => sum + Number(p.amount), 0)
        .toFixed(2)
    },
    openEditPayment(payment) {
      this.selectedPayment = { ...payment}
      this.showEditPaymentModal = true
    },
    async handlePaymentUpdated() {
      await this.refreshPayments()
      this.$notify.success('Payment updated successfully!')
    },
    confirmDeletePayment(payment) {
      this.selectedPayment = payment
      this.showDeleteConfirm = true
    },
    async deletePayment() {
      this.$loading.show('Deleting payment...')

      try {
        const supabase = useSupabaseClient()

        await supabase
          .from('payments')
          .delete()
          .eq('id', this.selectedPayment.id)

        await this.refreshPayments()

        this.$notify.success('Payment deleted')
      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to delete payment')
      } finally {
        this.showDeleteConfirm = false
        this.$loading.hide()
      }
    },
    async refreshPayments() {
      this.loading = true

      const supabase = useSupabaseClient()

      const { data, error } = await supabase
        .from('members')
        .select(`
          id,
          first_name,
          middle_name,
          last_name,
          suffix,
          payments (
            id,
            amount,
            receipt_number,
            category,
            created_at
          )
        `)
        .eq('family_id', this.family.id)
        .order('last_name')

      if (!error) {
        this.members = data || []
      }
    
      this.loading = false
    },
    openEditMember(member) {
      this.selectedMember = { ...member }
      this.showEditMemberModal = true
    },
    async handleMemberUpdated() {
      await this.refreshPayments()
      this.$notify.success('Member name updated successfully!')
    },
    confirmDeleteMember(member) {
      this.selectedMember = member
      this.showDeleteMemberConfirm = true
    },
    async deleteMember() {
      if (!this.selectedMember) return 

      try {
        const supabase = useSupabaseClient()

        if (this.selectedMember.payments.length > 0) {
          this.$notify.error('Cannot delete member with payments')
          return
        }

        await supabase
          .from('members')
          .delete()
          .eq('id', this.selectedMember.id)

          await this.refreshPayments()

          this.$notify.success('Member deleted successfullt')
      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to delete member')
      } finally {
        this.showDeleteMemberConfirm = false
        this.selectedMember = null
        this.$loading.hide()
      }
    },
    formatMemberName(m) {
  if (!m) return ''

  const last = m.last_name || ''
  const first = m.first_name || ''
  const middle = m.middle_name
    ? m.middle_name.trim().charAt(0).toUpperCase() + '.'
    : ''
  const suffix = m.suffix ? ` ${m.suffix}` : ''

  return `${last}, ${first}${middle ? ' ' + middle : ''}${suffix}`
},

    formatPersonName(p) {
      if (!p) return ''

      const last = p.last_name || ''
      const first = p.first_name || ''
      const middle = p.middle_name
        ? p.middle_name.charAt(0).toUpperCase() + '.'
        : ''
      const suffix = p.suffix ? ` ${p.suffix}` : ''

      return `${last}, ${first}${middle ? ' ' + middle : ''}${suffix}`
    }
  },

async mounted() {
  const supabase = useSupabaseClient()

  const { data, error } = await supabase
    .from('members')
    .select(`
      id,
        first_name,
        middle_name,
        last_name,
        suffix,
      payments (
        id,
        amount,
        receipt_number,
        category,
        created_at
      )
    `)
    .eq('family_id', this.family.id)
    .order('last_name')

  if (!error) {
    this.members = (data || []).map(m => ({
      ...m,
      payments: m.payments || []
    }))
  }

  this.loading = false
}

}
</script>
