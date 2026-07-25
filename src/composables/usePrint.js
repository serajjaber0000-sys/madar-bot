import { ref } from 'vue'

export function usePrint() {
  const printing = ref(false)

  async function printElement(selector) {
    printing.value = true
    try {
      const element = typeof selector === 'string' ? document.querySelector(selector) : selector
      if (!element) return

      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طباعة</title>
          <style>
            body { font-family: 'Cairo', 'Tajawal', Arial, sans-serif; direction: rtl; padding: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #333; padding: 8px; text-align: center; }
            th { background: #1a2a3a; color: #fff; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${element.innerHTML}
          <script>window.onload=()=>{window.print();window.close();}<\/script>
        </body>
        </html>
      `)
      printWindow.document.close()
    } finally {
      printing.value = false
    }
  }

  function printPage() {
    window.print()
  }

  return { printing, printElement, printPage }
}
