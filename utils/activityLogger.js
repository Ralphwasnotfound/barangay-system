export async function logActivity(supabase, {
    action,
    entity,
    description,
    amount = null
}) {
    await supabase
        .from('activity_logs')
        .insert({
            action,
            entity,
            description,
            amount
        })
}
