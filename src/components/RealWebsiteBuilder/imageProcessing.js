// Browser-side image compression used before images enter the existing website project record.
const MAX_DIMENSION = 1600
const OUTPUT_QUALITY = 0.82

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read this image.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to process this image.'))
    image.src = source
  })
}

export async function compressImage(file, onProgress = () => {}) {
  if (!file?.type?.startsWith('image/')) throw new Error('Please choose an image file.')
  onProgress(15)
  const source = await readFile(file)
  onProgress(40)
  const image = await loadImage(source)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
  onProgress(75)
  const dataUrl = canvas.toDataURL('image/webp', OUTPUT_QUALITY)
  onProgress(100)
  return { id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: file.name, type: 'image/webp', originalSize: file.size, storedSize: Math.round(dataUrl.length * 0.75), width: canvas.width, height: canvas.height, dataUrl, updatedAt: new Date().toISOString() }
}

export function imageSource(image) { return image?.dataUrl || '' }

export function imageDataUrls(images = {}, slot) {
  const value = images?.[slot]
  if (!value) return []
  if (Array.isArray(value)) return value.map(imageSource).filter(Boolean)
  const url = imageSource(value)
  return url ? [url] : []
}

export function firstImageUrl(images = {}, slot, fallback = '') {
  return imageDataUrls(images, slot)[0] || fallback
}
