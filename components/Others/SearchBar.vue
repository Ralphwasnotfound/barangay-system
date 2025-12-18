<template>
  <div class="w-full sm:max-w-sm">
    <div class="relative">
      <svg
        class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
      </svg>

      <input
        v-model="query"
        type="text"
        placeholder="Search family or address…"
        class="w-full pl-9 pr-9 py-2 border rounded-lg text-sm
               focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      <!-- Clear button -->
      <button
        v-if="query"
        @click="clear"
        class="absolute right-3 top-1/2 -translate-y-1/2
               text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script>
export default {
    props: {
        type: String,
        default: ''
    },
  emits: ['search'],
  data() {
    return {
      query: this.modelValue,
      timer: null
    }
  },
  watch: {
    modelValue(val) {
        this.query = val
    },
    query(val) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('search', val)
      }, 400) // 👈 debounce (400ms)
    }
  },
  methods: {
    clear() {
      this.query = ''
      this.$emit('search', '')
    }
  }
}
</script>
