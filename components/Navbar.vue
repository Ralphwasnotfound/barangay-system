<template>
  <nav class="fixed top-0 z-20 w-full bg-white border-b border-gray-200">
    <div class="max-w-screen-xl mx-auto flex items-center justify-between p-4">

      <!-- LOGO -->
      <NuxtLink to="/" class="flex items-center gap-3">
        <img
          src="/img/WestKibaweLogo.png"
          class="h-10 w-10"
          alt="Logo"
        />
      </NuxtLink>

      <!-- BURGER BUTTON (SMALL SCREENS ONLY) -->
      <button
        @click="toggleMenu"
        class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
        aria-label="Open menu"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <!-- MENU -->
      <div
        :class="{ hidden: !menuOpen }"
        class="absolute top-full left-0 w-full md:static md:block md:w-auto bg-white md:bg-transparent"
      >
        <ul
          class="flex flex-col md:flex-row md:items-center md:space-x-8 p-4 md:p-0 border md:border-0 border-gray-200"
        >
          <li>
            <NuxtLink to="/" class="block py-2 text-blue-600 font-medium md:p-0">
              Home
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/people" class="block py-2 text-gray-700 hover:text-blue-600 md:p-0">
                People
            </NuxtLink>
          </li>
          <li>
            <NuxtLink to="/login" class="block py-2 text-gray-700 hover:text-blue-600 md:p-0">
                <button
                    type="button"
                    class="inline-flex items-center justify-center rounded-full
                        px-4 py-2.5 text-sm font-medium leading-5
                        text-white bg-blue-600
                        hover:bg-blue-700
                        focus:outline-none focus:ring-4 focus:ring-blue-300
                        transition"
                    >
                    Login
                    </button>
            </NuxtLink>
          </li>
        </ul>
      </div>

    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      menuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen
    }
  }
}
</script>
