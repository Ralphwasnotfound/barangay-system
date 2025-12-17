<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-3">
    <div class="w-full max-w-sm bg-white rounded-lg shadow-lg">

      <!-- HEADER -->
      <div class="px-5 py-4 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ title || 'Confirm Delete' }}
        </h3>
      </div>

      <!-- BODY -->
      <div class="px-5 py-4 text-sm text-gray-600">
        {{ message || 'Are you sure? This action cannot be undone.' }}
      </div>

      <!-- FOOTER -->
      <div class="flex justify-end gap-3 px-5 py-4 border-t">
        <button
          @click="$emit('cancel')"
          class="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancel
        </button>

        <button
          @click="$emit('confirm')"
          class="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'DeleteConfirmModal',
  props: {
    title: String,
    message: String
  }
}
</script>
