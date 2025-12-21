export function formatCurrency(value) {
    return Number(value || 0).toLocaleString()
}

export function formatDate(date) {
    return new Date(date).toLocaleString()
}
