<template>
  <!-- MOBILE TOGGLE BUTTON -->
  <button
    @click="sidebarOpen = true"
    class="inline-flex items-center p-2 m-3 text-gray-700 rounded-lg sm:hidden
           hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
  >
    <span class="sr-only">Open sidebar</span>
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  </button>

  <!-- OVERLAY (MOBILE) -->
  <div
    v-if="sidebarOpen"
    @click="sidebarOpen = false"
    class="fixed inset-0 bg-black/40 z-30 sm:hidden"
  ></div>

  <!-- SIDEBAR -->
  <aside
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    class="fixed top-0 left-0 z-40 w-64 h-screen bg-white border-r border-gray-200
           transition-transform sm:translate-x-0"
  >
    <div class="h-full px-3 py-4 overflow-y-auto">

      <!-- LOGO -->
      <div class="flex flex-col items-center justify-center mb-6 px-4">
        <img
          src="/img/WestKibaweLogo.png"
          class="h-28 w-28"
          alt="Logo"
        />
        <span class="text-lg font-semibold text-gray-900">
          Admin
        </span>
      </div>

      <!-- MENU -->
      <ul class="space-y-1 text-sm font-medium">
        <li>
          <NuxtLink
            to="/admin/home"
            class="flex items-center px-3 py-2 rounded-lg text-gray-700
                   hover:bg-gray-100"
            @click="sidebarOpen = false"
          >
            Dashboard
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/people"
            class="flex items-center px-3 py-2 rounded-lg text-gray-700
                   hover:bg-gray-100"
            @click="sidebarOpen = false"
          >
            People Directory
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/reports/summary"
            class="flex items-center px-3 py-2 rounded-lg text-gray-700
                   hover:bg-gray-100"
            @click="sidebarOpen = false"
          >
            Reports
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/activity-logs"
            class="flex items-center px-3 py-2 rounded-lg text-gray-700
                   hover:bg-gray-100"
            @click="sidebarOpen = false"
          >
            Activity Logs
          </NuxtLink>
        </li>

        <li class="pt-2 border-t border-gray-200">
          <button
            @click="logout"
            class="w-full text-left px-3 py-2 rounded-lg text-red-600
                   hover:bg-red-50"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script>
export default {
  data() {
    return {
      sidebarOpen: false
    }
  },
  methods: {
    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      navigateTo('/')
    }
  }
}
</script>
