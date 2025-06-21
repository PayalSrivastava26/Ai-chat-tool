export function checkHeading(str) {
  return /^(\*)(\*)(.*)\*$/.test(str)
}

export function replaceHeadingStarts(str) {
  return str.replace(/^(\*)(\*)|(\*)$/g, '')
}

export function formatMessage(message) {
  return message.charAt(0).toUpperCase() + message.slice(1).trim()
}

export function saveToHistory(question, maxItems = 20) {
  if (!question) return

  let history = JSON.parse(localStorage.getItem('history')) || []
  
  // Add new question to beginning
  history = [formatMessage(question), ...history]
  
  // Remove duplicates
  history = [...new Set(history)]
  
  // Limit to maxItems
  history = history.slice(0, maxItems)
  
  localStorage.setItem('history', JSON.stringify(history))
  return history
}

export function getHistoryFromStorage() {
  return JSON.parse(localStorage.getItem('history')) || []
}

export function clearHistoryFromStorage() {
  localStorage.removeItem('history')
}

export function removeFromHistory(itemToRemove) {
  let history = getHistoryFromStorage()
  history = history.filter(item => item !== itemToRemove)
  localStorage.setItem('history', JSON.stringify(history))
  return history
}