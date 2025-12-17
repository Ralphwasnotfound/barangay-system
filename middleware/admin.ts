export default defineNuxtRouteMiddleware(async () => {
    const supabase = useSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== 'admin@gmail.com') {
        return navigateTo('/') // or /login
    }
})
