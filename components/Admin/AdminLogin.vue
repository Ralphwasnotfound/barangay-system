<template>
    <div class="flex items-center justify-center min-h-screen p-4">
        <div class="w-full max-w-sm bg-white rounded-lg shadow p-6">
            <form @submit.prevent="login" class="max-w-sm mx-auto">

                
                <!-- EMAIL -->
                <div class="mb-5">
                <label for="email" class="block mb-2.5 text-sm font-medium text-gray-900">
                    Email
                </label>
                <input
                    v-model="email"
                    type="email"
                    id="email"
                    class="block w-full rounded-lg border border-gray-300
                        bg-gray-50 px-3 py-2.5 text-sm text-gray-900
                        placeholder-gray-400
                        focus:border-blue-600 focus:ring-2 focus:ring-blue-300
                        transition"
                    placeholder="name@example.com"
                    required
                  />
                </div>
            
                <!-- PASSWORD -->
                <div class="mb-5">
                  <label for="password" class="block mb-2.5 text-sm font-medium text-gray-900">
                    Your password
                  </label>
                  <input
                    v-model="password"
                    type="password"
                    id="password"
                    class="block w-full rounded-lg border border-gray-300
                           bg-gray-50 px-3 py-2.5 text-sm text-gray-900
                           placeholder-gray-400
                           focus:border-blue-600 focus:ring-2 focus:ring-blue-300
                           transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
            
                <!-- REMEMBER / TERMS -->
                <!-- <label class="flex items-start gap-2 mb-5">
                  <input
                    type="checkbox"
                    class="mt-1 h-4 w-4 rounded border-gray-300
                           text-blue-600 focus:ring-2 focus:ring-blue-300"
                    required
                  />
                  <span class="text-sm text-gray-700 select-none">
                    I agree with the
                    <a href="#" class="text-blue-600 hover:underline">
                      terms and conditions
                    </a>.
                  </span>
                </label> -->
            
                <!-- SUBMIT -->
                <button
                  type="submit"
                  :disabled="loading"
                  class="inline-flex w-full justify-center rounded-lg
                         bg-blue-600 px-4 py-2.5 text-sm font-medium text-white
                         hover:bg-blue-700
                         focus:outline-none focus:ring-4 focus:ring-blue-300
                         transition"
                >
                    {{ loading ? 'Logging in...' : 'Login' }}
                </button>
                <p v-if="errorMessage" class="mt-4 text-sm text-red-600 text-center">
                    {{ errorMessage }}
                </p>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                email: '',
                password: '',
                loading: false,
                errorMessage: ''
            }
        },
        methods: {
            async login() {
                this.errorMessage = ''
                this.loading = true

                const supabase = useSupabaseClient()

                const { error } = await supabase.auth.signInWithPassword({
                    email: this.email,
                    password: this.password
                })

                this.loading = false
                if (error) {
                    this.errorMessage = error.message
                    return
                }

                navigateTo('/admin/home')
            }
        }
    }
</script>

<style scoped>

</style>