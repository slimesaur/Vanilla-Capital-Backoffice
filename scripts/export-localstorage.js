/**
 * Run this script in the browser console of the OLD Vite app
 * to export all localStorage data as a JSON file.
 *
 * Then upload the JSON via POST /api/migrate/import on the new Next.js app.
 */
(function exportLocalStorageData() {
  const data = {
    clients: JSON.parse(localStorage.getItem('vanilla-clients') || '[]'),
    suitabilityForms: JSON.parse(localStorage.getItem('vanilla-suitability-forms') || '[]'),
    suitabilityResponses: JSON.parse(localStorage.getItem('vanilla-suitability-responses') || '[]'),
    registrationResponses: JSON.parse(localStorage.getItem('vanilla-registration-responses') || '[]'),
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vanilla-backoffice-export-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  console.log('Export complete:', {
    clients: data.clients.length,
    suitabilityForms: data.suitabilityForms.length,
    suitabilityResponses: data.suitabilityResponses.length,
    registrationResponses: data.registrationResponses.length,
  })
})()
