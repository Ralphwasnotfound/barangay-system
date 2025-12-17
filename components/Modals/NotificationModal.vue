<template>
  <transition name="slide-fade">
    <div
      v-if="visible"
      class="fixed top-5 right-5 z-[9999] w-[320px] rounded-xl shadow-lg px-4 py-3 text-sm"
      :class="typeClasses"
    >
      <div class="font-semibold mb-1">{{ title }}</div>
      <div class="whitespace-pre-line">
        {{ message }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'NotificationModal',
  expose: ['show'],

  data() {
    return {
      visible: false,
      title: '',
      message: '',
      type: 'success',
      timer: null
    }
  },

  computed: {
    typeClasses() {
      return {
        success: 'bg-green-600 text-white',
        error: 'bg-red-600 text-white',
        warning: 'bg-yellow-500 text-black',
        info: 'bg-blue-600 text-white'
      }[this.type]
    }
  },

  methods: {
    show({ title = '', message = '', type = 'success', duration = 4000 }) {
      this.title = title
      this.message = message
      this.type = type
      this.visible = true

      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.visible = false
      }, duration)
    }
  },

  beforeUnmount() {
    clearTimeout(this.timer)
  }
}
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
