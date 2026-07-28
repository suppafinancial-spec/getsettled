// Parse a 'YYYY-MM-DD' date-only string as a local-midnight Date, avoiding
// the day-before shift that new Date(dateStr) causes in timezones behind UTC.
export function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Add (or subtract, for negative days) days to a 'YYYY-MM-DD' string,
// returning a new 'YYYY-MM-DD' string.
export function addDays(dateStr, days) {
  const date = parseLocalDate(dateStr)
  date.setDate(date.getDate() + days)
  return toDateInputValue(date)
}
