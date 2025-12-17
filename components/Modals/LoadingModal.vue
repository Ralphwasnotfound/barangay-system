<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-[9998] flex items-center justify-center
             bg-black/20"
    >
      <div class="flex flex-col items-center gap-3">

        <!-- SPINNER -->
        <div role="status">
          <svg
            aria-hidden="true"
            class="w-10 h-10 text-gray-300 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348"
              fill="currentFill"
            />
          </svg>
        </div>

        <!-- TEXT -->
        <p class="text-sm text-white font-medium">
          {{ message || 'Please wait…' }}
        </p>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'LoadingModal',
  expose: ['show', 'hide'],

  data() {
    return {
      visible: false,
      message: ''
    }
  },

  methods: {
    show(msg = 'Please wait...') {
      this.message = msg
      this.visible = true
    },

    hide() {
      this.visible = false
      this.message = ''
    }
  }
}
</script>
