<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-5 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Add Head of the Family
        </h2>
        <button @click="$emit('close')" class="text-gray-500 text-xl">&times;</button>
      </div>

      <!-- BODY -->
      <form @submit.prevent="submit" class="px-5 py-4 space-y-4">

        <!-- FIRST NAME -->
        <div>
          <label class="block text-sm font-medium mb-1">First Name</label>
          <input
            v-model="form.first_name"
            required
            placeholder="Dan Mar Alvin"
            class="input"
          />
        </div>

        <!-- MIDDLE NAME (OPTIONAL) -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Middle Name <span class="text-gray-400">(optional)</span>
          </label>
          <input
            v-model="form.middle_name"
            placeholder="Romano"
            class="input"
          />
          <p v-if="middleNameError" class="text-xs text-red-600 mt-1">
            Middle name must be at least 2 characters or left blank
          </p>
        </div>

        <!-- LAST NAME -->
        <div>
          <label class="block text-sm font-medium mb-1">Last Name</label>
          <input
            v-model="form.last_name"
            required
            placeholder="Batiancila"
            class="input"
          />
        </div>

        <!-- SUFFIX -->
        <div>
          <label class="block text-sm font-medium mb-1">
            Suffix <span class="text-gray-400">(optional)</span>
          </label>
          <input
            v-model="form.suffix"
            placeholder="Jr., III"
            class="input"
          />
        </div>

        <!-- ADDRESS -->
        <div>
          <label class="block text-sm font-medium mb-1">Address</label>
          
          <select
            v-model="form.purok"
            required
            class="input"
          >
            <option disabled value="">Select Purok</option>
            <option v-for="n in 7" :key="n" :value="n">
              Purok {{ n }}
            </option>
          </select>

          <p class="text-xs text-gray-500 mt-1">
            West Kibawe, Kibawe Bukidnon
          </p>
        </div>

        <!-- ERROR -->
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <!-- ACTIONS -->
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="$emit('close')" class="btn-outline">
            Cancel
          </button>
          <button type="submit" :disabled="loading || middleNameError" class="btn-primary">
            {{ loading ? 'Saving…' : 'Save' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import { logActivity } from '@/utils/activityLogger'
import { useSupabaseClient } from '#imports'

export default {
  emits: ['close', 'saved'],

  data() {
    return {
      form: {
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        purok: ''
      },
      loading: false,
      error: null
    }
  },

  computed: {
    middleNameError() {
      return !!(
        this.form.middle_name &&
        this.form.middle_name.trim().length === 1
      )
    }
  },

  methods: {
    async submit() {
      this.loading = true
      this.error = null

      const supabase = useSupabaseClient()
      const fullAddress = `Purok ${this.form.purok}, West Kibawe, Kibawe Bukidnon`

      const { data, error } = await supabase
        .from('families')
        .insert({
          first_name: this.form.first_name.trim(),
          middle_name: this.form.middle_name?.trim() || null,
          last_name: this.form.last_name.trim(),
          suffix: this.form.suffix?.trim() || null,
          address: fullAddress
        })
        .select()
        .single()

      if (error) {
        this.error = error.message || 'Failed to save family.'
        this.loading = false
        return
      }

      await logActivity(supabase, {
        action: 'create',
        entity: 'family',
        description: `Added head of the family: ${data.first_name} ${data.last_name}`
      })

      this.$emit('saved')
      this.$emit('close')
      this.loading = false
    }
  }
}
</script>


<style scoped>
.input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  outline: none;
}
.input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgb(37 99 235 / 0.3);
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
.btn-primary:hover { background: #1d4ed8; }

.btn-outline {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
</style>
