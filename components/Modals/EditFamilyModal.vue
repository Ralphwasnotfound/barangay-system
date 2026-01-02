<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-md bg-white rounded-xl shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Edit Family
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 text-xl"
        >
          &times;
        </button>
      </div>

      <!-- BODY -->
      <div class="px-6 py-5 space-y-4">

        <!-- FIRST NAME -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-900">
            First Name
          </label>
          <input
            v-model="first_name"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                   rounded-lg focus:ring-blue-500 focus:border-blue-500
                   block w-full p-2.5"
          />
        </div>

        <!-- MIDDLE NAME -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-900">
            Middle Name <span class="text-gray-400">(optional)</span>
          </label>
          <input
            v-model="middle_name"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                   rounded-lg focus:ring-blue-500 focus:border-blue-500
                   block w-full p-2.5"
          />
          <p v-if="middleNameError" class="mt-1 text-xs text-red-600">
            Middle name must be at least 2 characters or left blank
          </p>
        </div>

        <!-- LAST NAME -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-900">
            Last Name
          </label>
          <input
            v-model="last_name"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                   rounded-lg focus:ring-blue-500 focus:border-blue-500
                   block w-full p-2.5"
          />
        </div>

        <!-- SUFFIX -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-900">
            Suffix <span class="text-gray-400">(optional)</span>
          </label>
          <input
            v-model="suffix"
            type="text"
            placeholder="Jr., Sr., III"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                   rounded-lg focus:ring-blue-500 focus:border-blue-500
                   block w-full p-2.5"
          />
        </div>

        <!-- ADDRESS -->
        <div>
          <label class="block mb-1 text-sm font-medium text-gray-900">
            Address
          </label>
          <input
            v-model="address"
            type="text"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm
                   rounded-lg focus:ring-blue-500 focus:border-blue-500
                   block w-full p-2.5"
          />
        </div>

      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-sm font-medium text-gray-700
                 bg-white border border-gray-300 rounded-lg
                 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200"
        >
          Cancel
        </button>

        <button
          @click="save"
          :disabled="middleNameError"
          class="px-4 py-2 text-sm font-medium text-white
                 bg-blue-600 rounded-lg hover:bg-blue-700
                 focus:ring-4 focus:ring-blue-300
                 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
      </div>

    </div>
  </div>
</template>


<script>
import { logActivity } from '@/utils/activityLogger'
import { useSupabaseClient } from '#imports'

export default {
  name: 'EditFamilyModal',

  props: {
    family: {
      type: Object,
      required: true
    }
  },

  data() {
    return {
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      address: ''
    }
  },

  computed: {
    middleNameError() {
      return (
        this.middle_name &&
        this.middle_name.trim().length === 1
      )
    }
  },

  mounted() {
    this.first_name  = this.family.first_name
    this.middle_name = this.family.middle_name || ''
    this.last_name   = this.family.last_name
    this.suffix      = this.family.suffix || ''
    this.address     = this.family.address
  },

  methods: {
    async save() {
      if (!this.first_name.trim() || !this.last_name.trim()) {
        this.$notify.error('First and last name are required')
        return
      }

      if (this.middleNameError) {
        return
      }

      this.$loading.show('Updating family...')

      const supabase = useSupabaseClient()

      try {
        await supabase
          .from('families')
          .update({
            first_name: this.first_name.trim(),
            middle_name: this.middle_name.trim() || null,
            last_name: this.last_name.trim(),
            suffix: this.suffix.trim() || null,
            address: this.address.trim()
          })
          .eq('id', this.family.id)

        const changes = []

        if (this.first_name !== this.family.first_name) changes.push('first name')
        if (this.middle_name !== (this.family.middle_name || '')) changes.push('middle name')
        if (this.last_name !== this.family.last_name) changes.push('last name')
        if (this.suffix !== (this.family.suffix || '')) changes.push('suffix')
        if (this.address !== this.family.address) changes.push('address')

        if (changes.length) {
          await logActivity(supabase, {
            action: 'update',
            entity: 'family',
            description: `Updated family (${changes.join(', ')})`
          })
        }

        this.$emit('saved')
        this.$emit('close')

      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to update family')
      } finally {
        this.$loading.hide()
      }
    }
  }
}
</script>
