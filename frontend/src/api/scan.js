import client from './client'

/**
 * Upload image with real-time progress tracking via XMLHttpRequest.
 * @param {File} file - Image file to upload
 * @param {Function} onProgress - Called with percent (0-100)
 * @returns {Promise<object>} scan result
 */
export const uploadScan = (file, onProgress) => {
  return new Promise((resolve, reject) => {
    const token = localStorage.getItem('ss_token')
    const formData = new FormData()
    formData.append('image', file)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/scan/upload')
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        onProgress && onProgress(pct)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(new Error(err.error || `HTTP ${xhr.status}`))
        } catch {
          reject(new Error(`HTTP ${xhr.status}`))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Network error'))
    xhr.send(formData)
  })
}

export const demoScan = () => client.post('/scan/demo')

export const getHistory = (page = 1, limit = 10) =>
  client.get(`/history/?page=${page}&limit=${limit}`)

export const getScan = (scanId) => client.get(`/history/${scanId}`)

export const getStats = () => client.get('/history/stats')
