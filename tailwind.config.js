/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./components/**/*.{vue,js,ts}",
        "./layouts/**/*.vue",
        "./pages/**/*.vue",
        "./plugins/**/*.{js,ts}",
        "./app.vue",
        "./node_modules/flowbite/**/*.js",
    ],
    theme: {
        extend: {
            /* OPTIONAL: basic design tokens (safe) */
            colors: {
                brand: {
                    DEFAULT: '#2563eb', // blue-600
                    strong: '#1e40af',  // blue-800
                },
            },
            borderRadius: {
                base: '0.5rem',
            },
            boxShadow: {
                xs: '0 1px 2px rgba(0,0,0,0.05)',
            },
        },
    },
    plugins: [
        require('flowbite/plugin'),
    ],
}
