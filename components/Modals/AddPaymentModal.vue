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
            <option value="" disabled>Select member</option>
            <option
              v-for="m in members"
              :key="m.id"
              :value="m.id"
            >
              {{ m.full_name }}
            </option>
          </select>
        </div>

        <!-- AMOUNT -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Amount (₱)
          </label>
          <input
            v-model="form.amount"
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
        member_id: '',
        amount: '',
        category: '',
        receipt_number: ''
      }
    }
  },
  async mounted() {
    const supabase = useSupabaseClient()

    const { data, error } = await supabase
      .from('members')
      .select('id, full_name')
      .eq('family_id', this.family.id)
      .order('full_name')

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

      const { error } = await supabase
        .from('payments')
        .insert([{
          family_id: this.family.id,
          member_id: this.form.member_id,
          amount: this.form.amount,
          category: this.form.category,
          receipt_number: this.form.receipt_number
        }])

      if (error) {
        this.error = error.message
        this.loading = false
        return
      }

      this.$emit('saved')
      this.$emit('close')
      this.loading = false
    }
  }
}
</script>
