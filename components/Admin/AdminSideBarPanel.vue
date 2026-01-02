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
    <div class="h-full px-3 py-4 flex flex-col">

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
      <ul class="space-y-1 text-sm font-medium flex flex-col flex-1 overflow-y-auto">
        <li>
          <NuxtLink
            to="/admin/home"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            exact-active-class="bg-gray-200 text-gray-900 font-semibold"
            @click="sidebarOpen = false"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(0,0,0,0.9)"><path d="M3 12C3 12.5523 3.44772 13 4 13H10C10.5523 13 11 12.5523 11 12V4C11 3.44772 10.5523 3 10 3H4C3.44772 3 3 3.44772 3 4V12ZM3 20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V16C11 15.4477 10.5523 15 10 15H4C3.44772 15 3 15.4477 3 16V20ZM13 20C13 20.5523 13.4477 21 14 21H20C20.5523 21 21 20.5523 21 20V12C21 11.4477 20.5523 11 20 11H14C13.4477 11 13 11.4477 13 12V20ZM14 3C13.4477 3 13 3.44772 13 4V8C13 8.55228 13.4477 9 14 9H20C20.5523 9 21 8.55228 21 8V4C21 3.44772 20.5523 3 20 3H14Z"></path></svg>
            Dashboard
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/people"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            exact-active-class="bg-gray-200 text-gray-900 font-semibold"
            @click="sidebarOpen = false"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(0,0,0,1)"><path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM17.3628 15.2332C20.4482 16.0217 22.7679 18.7235 22.9836 22H20C20 19.3902 19.0002 17.0139 17.3628 15.2332ZM15.3401 12.9569C16.9728 11.4922 18 9.36607 18 7C18 5.58266 17.6314 4.25141 16.9849 3.09687C19.2753 3.55397 21 5.57465 21 8C21 10.7625 18.7625 13 16 13C15.7763 13 15.556 12.9853 15.3401 12.9569Z"></path></svg>
            People Directory
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/reports/summary"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            exact-active-class="bg-gray-200 text-gray-900 font-semibold"
            @click="sidebarOpen = false"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(0,0,0,1)"><path d="M12.4142 5H21C21.5523 5 22 5.44772 22 6V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H10.4142L12.4142 5ZM11 9V17H13V9H11ZM15 12V17H17V12H15ZM7 14V17H9V14H7Z"></path></svg>
            Reports
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/admin/activity-logs"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            exact-active-class="bg-gray-200 text-gray-900 font-semibold"
            @click="sidebarOpen = false"
          >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="rgba(0,0,0,1)"><path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12H4C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C9.53614 4 7.33243 5.11383 5.86492 6.86543L8 9H2V3L4.44656 5.44648C6.28002 3.33509 8.9841 2 12 2ZM13 7L12.9998 11.585L16.2426 14.8284L14.8284 16.2426L10.9998 12.413L11 7H13Z"></path></svg>
            Activity Logs
          </NuxtLink>
        </li>
      </ul>

      <div class="mt-auto pt-2 border-t border-gray-200">
        <button
            @click="logout"
            class="w-full text-center px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
      </div>
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
