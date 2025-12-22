<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Edit Payment
        </h2>
        <button
          @click="$emit('close')"
          class="text-xl text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>

      <!-- BODY -->
      <div class="px-6 py-5 space-y-4">

        <!-- AMOUNT -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Amount (₱)
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- RECEIPT NUMBER -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Receipt Number
          </label>
          <input
            v-model="form.receipt_number"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- CATEGORY -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            v-model="form.category"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- DATE -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            v-model="form.created_at"
            type="date"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-3 px-6 py-4 border-t">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          @click="save"
          class="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

    </div>
  </div>
</template>

<script>
import { logActivity } from '@/utils/activityLogger'
import { useSupabaseClient } from '#imports'

export default {
  name: 'EditPaymentModal',

  props: {
    payment: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      form: {
        amount: null,
        receipt_number: '',
        category: '',
        created_at: ''
      }
    }
  },

  mounted() {
    this.form = {
      amount: this.payment.amount,
      receipt_number: this.payment.receipt_number,
      category: this.payment.category || '',
      created_at: this.payment.created_at?.split('T')[0] || ''
    }
  },

  methods: {
    normalizeReceipt(value) {
      return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    },

    async save() {
      if (!this.form.receipt_number.trim()) {
        this.$notify.error('Receipt number is required')
        return
      }

      this.$loading.show('Updating payment...')

      const supabase = useSupabaseClient()

      try {
        const normalized = this.normalizeReceipt(this.form.receipt_number)

        // 🔒 Check for duplicate receipt (excluding this payment)
        const { data: existing } = await supabase
          .from('payments')
          .select('id')
          .eq('receipt_number_normalized', normalized)
          .neq('id', this.payment.id)
          .maybeSingle()

        if (existing) {
          this.$notify.error('Receipt number already exists')
          this.$loading.hide()
          return
        }

        await supabase
          .from('payments')
          .update({
            amount: Number(this.form.amount),
            receipt_number: this.form.receipt_number.trim(),
            receipt_number_normalized: normalized,
            category: this.form.category.trim() || null,
            created_at: this.form.created_at
          })
          .eq('id', this.payment.id)

        // 🔍 Detect changes for logging
        const changes = []

        if (this.form.amount !== this.payment.amount) changes.push('amount')
        if (this.form.receipt_number !== this.payment.receipt_number) changes.push('receipt number')
        if ((this.form.category || '') !== (this.payment.category || '')) changes.push('category')
        if (this.form.created_at !== this.payment.created_at?.split('T')[0]) changes.push('date')

        if (changes.length) {
          await logActivity(supabase, {
            action: 'update',
            entity: 'payment',
            description: `Updated payment (${changes.join(', ')}) — Receipt #${this.form.receipt_number}`
          })
        }

        this.$emit('saved')
        this.$emit('close')

      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to update payment')
      } finally {
        this.$loading.hide()
      }
    }
  }
}
</script>
