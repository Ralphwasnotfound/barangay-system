<template>
  <nav
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-2 mt-4"
    aria-label="Pagination"
  >
    <!-- Previous -->
    <button
      :disabled="page === 1"
      @click="$emit('update:page', page - 1)"
      class="px-3 py-1.5 rounded border text-sm
             disabled:opacity-50 disabled:cursor-not-allowed
             hover:bg-gray-100"
    >
      ←
    </button>

    <!-- Page info -->
    <span class="text-sm text-gray-600">
      Page {{ page }} of {{ totalPages }}
    </span>

    <!-- Next -->
    <button
      :disabled="page === totalPages"
      @click="$emit('update:page', page + 1)"
      class="px-3 py-1.5 rounded border text-sm
             disabled:opacity-50 disabled:cursor-not-allowed
             hover:bg-gray-100"
    >
      →
    </button>
  </nav>
</template>

<script>
export default {
  props: {
    page: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  }
}
</script>
