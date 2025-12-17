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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            v-model="full_name"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter full name"
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
          Save
        </button>
      </div>

    </div>
  </div>
</template>

<script>
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
      full_name: ''
    }
  },

  mounted() {
    this.full_name = this.member.full_name
  },

  methods: {
    async save() {
      if (!this.full_name.trim()) {
        this.$notify.error('Name cannot be empty')
        return
      }

      this.$loading.show('Updating member...')

      try {
        const supabase = useSupabaseClient()

        await supabase
          .from('members')
          .update({ full_name: this.full_name.trim() })
          .eq('id', this.member.id)

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
