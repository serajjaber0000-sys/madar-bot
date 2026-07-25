import { ref } from 'vue'

export function usePdfExport() {
  const exporting = ref(false)

  function loadHtml2Pdf() {
    return new Promise((resolve, reject) => {
      if (window.html2pdf) { resolve(window.html2pdf); return }
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
      script.onload = () => resolve(window.html2pdf)
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  async function exportToPdf(element, filename = 'document.pdf') {
    exporting.value = true
    try {
      const html2pdf = await loadHtml2Pdf()
      const el = typeof element === 'string' ? document.querySelector(element) : element
      if (!el) return
      await html2pdf().set({
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(el).save()
    } catch (e) {
      alert('حدث خطأ أثناء إنشاء الملف')
    } finally {
      exporting.value = false
    }
  }

  async function exportTableToPdf(headers, rows, title, filename = 'report.pdf') {
    exporting.value = true
    try {
      const html2pdf = await loadHtml2Pdf()
      const html = `
        <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; padding: 16px;">
          <h2 style="text-align:center; margin-bottom:12px;">${title}</h2>
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr>${headers.map(h => `<th style="background:#1a2a3a;color:#fff;padding:8px;border:1px solid #333;">${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td style="padding:6px;border:1px solid #ccc;text-align:center;">${cell ?? '—'}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </div>
      `
      const container = document.createElement('div')
      container.innerHTML = html
      document.body.appendChild(container)
      await html2pdf().set({
        margin: 10, filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).from(container).save()
      document.body.removeChild(container)
    } catch (e) {
    } finally {
      exporting.value = false
    }
  }

  return { exporting, exportToPdf, exportTableToPdf }
}
