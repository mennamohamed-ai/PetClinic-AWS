/**
 * Centralized API Service
 * يستخدم Environment Variables للـ API URL
 */

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || 'https://petclinic-prod-alb-2142133629.us-east-1.elb.amazonaws.com'

export const createApiUrl = (endpoint) => {
  // تأكد من أن الـ URL يبدأ بـ /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${API_BASE_URL}${normalizedEndpoint}`
}

export const getApiBaseUrl = () => {
  return API_BASE_URL
}

/**
 * إذا كنت تستخدم Vite (وليس React Create App)
 * استخدم VITE_APP_API_URL بدلاً من REACT_APP_API_URL
 * 
 * في .env:
 * VITE_APP_API_URL=https://petclinic-prod-alb-2142133629.us-east-1.elb.amazonaws.com
 */
