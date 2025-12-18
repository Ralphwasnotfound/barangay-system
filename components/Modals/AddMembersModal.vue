<template>
  <!-- OVERLAY -->
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <!-- MODAL -->
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 class="text-lg font-semibold text-gray-900">
            Add Member
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

        <!-- FIRST NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            v-model="form.first_name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-green-500
                   focus:border-green-500 outline-none"
          />
        </div>

        <!-- MIDDLE NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Middle Name (optional)
          </label>
          <input
            v-model="form.middle_name"
            type="text"
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-green-500
                   focus:border-green-500 outline-none"
          />
        </div>

        <!-- LAST NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            v-model="form.last_name"
            type="text"
            required
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-green-500
                   focus:border-green-500 outline-none"
          />
        </div>

        <!-- SUFFIX -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Suffix (optional)
          </label>
          <input
            v-model="form.suffix"
            type="text"
            placeholder="Jr., Sr., III"
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-green-500
                   focus:border-green-500 outline-none"
          />
        </div>

        <!-- RELATION -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Relation (optional)
          </label>
          <input
            v-model="form.relation"
            type="text"
            placeholder="Son / Daughter / Spouse"
            class="w-full rounded-lg border border-gray-300
                   px-3 py-2 text-sm
                   focus:ring-2 focus:ring-green-500
                   focus:border-green-500 outline-none"
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
            class="px-4 py-2 text-sm rounded-lg
                   border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 text-sm rounded-lg
                   bg-green-600 text-white hover:bg-green-700
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
  props: {
    family: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        relation: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    async submit() {
      this.loading = true
      this.error = null

      // ❗ Middle name validation
      if (this.form.middle_name && this.form.middle_name.length === 1) {
        this.error = 'Middle name must be at least 2 letters'
        this.loading = false
        return
      }

      const supabase = useSupabaseClient()

      const { error, status } = await supabase
        .from('members')
        .insert({
          family_id: this.family.id,
          first_name: this.form.first_name.trim(),
          middle_name: this.form.middle_name || null,
          last_name: this.form.last_name.trim(),
          suffix: this.form.suffix || null,
          relation: this.form.relation || null
        })

      // 🚫 Duplicate member
      if (status === 409) {
        this.error = 'This member already exists in this family.'
        this.loading = false
        return
      }

      // 🚫 Other error
      if (error) {
        this.error = error.message || 'Failed to add member.'
        this.loading = false
        return
      }

      // ✅ SUCCESS
      this.$emit('saved')
      this.$emit('close')
      this.loading = false
    }
  }
}
</script>
