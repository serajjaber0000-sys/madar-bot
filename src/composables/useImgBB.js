export async function uploadToImgBB(file) {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) throw new Error('Upload failed')

  const data = await response.json()
  if (!data.success) throw new Error(data.error?.message || 'Upload failed')

  return data.data.url
}
