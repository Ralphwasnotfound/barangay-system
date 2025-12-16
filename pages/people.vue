<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <!-- MAIN CONTENT WRAPPER -->
    <main class="px-3 sm:px-6 lg:px-10 py-20">
      <PeopleDirectory />
    </main>
  </div>
</template>

<script>
import PeopleDirectory from '~/components/Nav/PeopleDirectory.vue'
import Navbar from '~/components/Navbar.vue'

export default {
  components: {
    Navbar,
    PeopleDirectory
  }
}
</script>
