<template>
  <!-- OVERLAY -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <!-- MODAL -->
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Add Payment
          </h2>
          <p class="text-sm text-gray-500">
            {{ family.head_name }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
      </div>

      <!-- BODY -->
      <form @submit.prevent="submit" class="px-5 py-4 space-y-4">

        <!-- MEMBER -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Member
          </label>
          <select
            v-model="form.member_id"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option :value="null" disabled>Select member</option>
            <option
              v-for="m in members"
              :key="m.id"
              :value="m.id"
            >
              {{ formatMemberName(m) }}
            </option>
          </select>
        </div>

        <!-- AMOUNT -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Amount (₱)
          </label>
          <input
            v-model.number="form.amount"
            type="number"
            min="0"
            step="0.01"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <!-- CATEGORY -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Category
          </label>
          <input
            v-model="form.category"
            type="text"
            placeholder="Garbage / HOA / Other"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <!-- RECEIPT NO -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Receipt Number
          </label>
          <input
            v-model="form.receipt_number"
            type="text"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        </div>

        <!-- ERROR -->
        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-sm border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg
                   hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save Payment' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { logActivity } from '@/utils/activityLogger';
import { useSupabaseClient } from '#imports';

export default {
  props: {
    family: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      members: [],
      loading: false,
      error: null,
      form: {
        member_id: null,
        amount: null,
        category: '',
        receipt_number: ''
      }
    }
  },
  async mounted() {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
      .from('members')
      .select(`id, 
      first_name,
    middle_name,
    last_name,
    suffix
    `)
      .eq('family_id', this.family.id)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })

    if (error) {
      console.error(error)
    } else {
      this.members = data
    }
  },
  methods: {
    async submit() {
  this.loading = true
  this.error = null

  const supabase = useSupabaseClient()

  if (!this.form.receipt_number) {
    this.error = 'Receipt number is required.'
    this.loading = false
    return
  }

  const normalizeReceipt = this.normalizeReceipt(this.form.receipt_number)

  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('receipt_number_normalized', normalizeReceipt)
    .maybeSingle()

  if (existing) {
    this.error = 'Receipt number already exists.'
    this.loading = false
    return
  }

  const { data, error } = await supabase
    .from('payments')
    .insert({
      family_id: this.family.id,
      member_id: this.form.member_id,
      amount: Number(this.form.amount),
      category: this.form.category?.trim() || null,
      receipt_number: this.form.receipt_number.trim(),
      receipt_number_normalized: normalizeReceipt
    })
    .select()
    .single()

  if (error) {
    this.error = error.message
    this.loading = false
    return
  }

  const member = this.members.find(m => m.id === this.form.member_id)

  await logActivity(supabase, {
    action: 'create',
    entity: 'payment',
    description: `Added payment (${data.category || 'uncategorized'}) for ${member.last_name}, ${member.first_name} — Receipt #${data.receipt_number}`
  })

  this.$emit('saved')
  this.$emit('close')
  this.loading = false
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


    normalizeReceipt(value) {
      return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
    }
  }
}
</script>
