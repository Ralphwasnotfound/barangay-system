<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Edit Member
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

        <!-- FIRST NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            v-model="first_name"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- MIDDLE NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Middle Name (optional)
          </label>
          <input
            v-model="middle_name"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <p v-if="middleNameError" class="text-xs text-red-600 mt-1">
            Middle name must be at least 2 characters or left blank
          </p>
        </div>

        <!-- LAST NAME -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            v-model="last_name"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- SUFFIX -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Suffix (optional)
          </label>
          <input
            v-model="suffix"
            placeholder="Jr., Sr., III"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- RELATION -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Relation (optional)
          </label>
          <input
            v-model="relation"
            placeholder="Son / Daughter / Spouse"
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
          :disabled="middleNameError"
          class="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
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
  name: 'EditMemberModal',

  props: {
    member: {
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
      relation: ''
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
    this.first_name  = this.member.first_name
    this.middle_name = this.member.middle_name || ''
    this.last_name   = this.member.last_name
    this.suffix      = this.member.suffix || ''
    this.relation    = this.member.relation || ''
  },

  methods: {
    async save() {
      if (!this.first_name.trim() || !this.last_name.trim()) {
        this.$notify.error('First and last name are required')
        return
      }

      if (this.middleNameError) return

      this.$loading.show('Updating member...')

      const supabase = useSupabaseClient()

      try {
        await supabase
          .from('members')
          .update({
            first_name: this.first_name.trim(),
            middle_name: this.middle_name.trim() || null,
            last_name: this.last_name.trim(),
            suffix: this.suffix.trim() || null,
            relation: this.relation.trim() || null
          })
          .eq('id', this.member.id)

        const changes = []

        if (this.first_name !== this.member.first_name) changes.push('first name')
        if (this.middle_name !== (this.member.middle_name || '')) changes.push('middle name')
        if (this.last_name !== this.member.last_name) changes.push('last name')
        if (this.suffix !== (this.member.suffix || '')) changes.push('suffix')
        if (this.relation !== (this.member.relation || '')) changes.push('relation')

        if (changes.length) {
          await logActivity(supabase, {
            action: 'update',
            entity: 'member',
            description: `Updated member (${changes.join(', ')})`
          })
        }

        this.$emit('saved')
        this.$emit('close')

      } catch (err) {
        console.error(err)
        this.$notify.error('Failed to update member')
      } finally {
        this.$loading.hide()
      }
    }
  }
}
</script>
