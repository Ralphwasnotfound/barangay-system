<template>
    <div>
        <NavBar />
        <HomePage />
    </div>
</template>

<script>
import HomePage from '~/components/Nav/HomePage.vue';
import NavBar from '~/components/Navbar.vue';

    export default {
        components: {
            HomePage,
            NavBar
        }
    }
</script>

<style scoped>

</style>