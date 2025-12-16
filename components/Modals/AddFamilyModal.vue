<template>
  <!-- OVERLAY -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">

    <!-- MODAL -->
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Add Head of the Family
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-700 text-xl"
        >
          &times;
        </button>
      </div>

      <!-- BODY -->
      <form @submit.prevent="submit" class="px-5 py-4 space-y-4">

        <!-- HEAD NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Head of the Family
          </label>
          <input
            v-model="form.head_name"
            type="text"
            required
            placeholder="Juan Dela Cruz"
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 outline-none"
          />
        </div>

        <!-- ADDRESS -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            v-model="form.address"
            rows="3"
            required
            placeholder="Purok 1, West Kibawe"
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-blue-500
                   focus:border-blue-500 outline-none"
          ></textarea>
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
            class="px-4 py-2 text-sm rounded-lg
                   border border-gray-300
                   hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm rounded-lg
                   bg-blue-600 text-white
                   hover:bg-blue-700
                   disabled:opacity-50"
          >
            {{ loading ? 'Saving...' : 'Save' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        head_name: '',
        address: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async submit() {
      this.loading = true
      this.error = null

      const supabase = useSupabaseClient()

      const { error } = await supabase
        .from('families')
        .insert([this.form])

      if (error) {
        this.error = error.message
        this.loading = false
        return
      }

      // SUCCESS
      this.$emit('saved')
      this.$emit('close')
      this.loading = false
    }
  }
}
</script>
