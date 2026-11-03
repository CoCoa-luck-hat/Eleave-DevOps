const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

export const getImageUrl = (filename) => {
  if (!filename) {
    return ''
  }
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename
  }
  const prefix = BACKEND_URL ? `${BACKEND_URL}` : ''
  return `${prefix}/uploads/${filename}`
}

export default getImageUrl
