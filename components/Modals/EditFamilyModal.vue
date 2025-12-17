<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="flex items-center justify-between px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">
          Edit Family
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
            Head of the Family
          </label>
          <input
            v-model="head_name"
            class="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <input
            v-model="address"
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
          Save
        </button>
      </div>

    </div>
  </div>
</template>

<script>
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
      head_name: '',
      address: ''
    }
  },

  mounted() {
    this.head_name = this.family.head_name
    this.address = this.family.address
  },

  methods: {
    async save() {
      if (!this.head_name.trim()) {
        this.$notify.error('Head name is required')
        return
      }

      this.$loading.show('Updating family...')

      try {
        const supabase = useSupabaseClient()

        await supabase
          .from('families')
          .update({
            head_name: this.head_name.trim(),
            address: this.address.trim()
          })
          .eq('id', this.family.id)

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
