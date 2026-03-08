import axios, { AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

/**
 * Axios实例配置
 * 自动添加认证token和处理通用错误
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30秒超时
})

// 请求拦截器：添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    // 401未授权：清除token并跳转登录
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    // 403禁止访问
    if (error.response?.status === 403) {
      return Promise.reject(new Error('没有权限访问该资源'))
    }

    // 429请求过多
    if (error.response?.status === 429) {
      return Promise.reject(new Error('请求过于频繁，请稍后再试'))
    }

    // 500服务器错误
    if (error.response?.status === 500) {
      return Promise.reject(new Error('服务器错误，请稍后再试'))
    }

    // 网络错误
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络'))
    }

    // 其他错误：使用服务器返回的错误信息
    const message = error.response?.data?.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

/**
 * API接口封装
 */
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, username: string, password: string) =>
    api.post('/auth/register', { email, username, password }),
  
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  }
}

export const chatAPI = {
  getSessions: () => api.get('/chat/sessions'),
  
  getSession: (sessionId: string) => api.get(`/chat/sessions/${sessionId}`),
  
  createSession: (title: string) => api.post('/chat/sessions', { title }),
  
  deleteSession: (sessionId: string) => api.delete(`/chat/sessions/${sessionId}`)
}

export const guideAPI = {
  getGuides: () => api.get('/guides'),
  
  getGuide: (id: string) => api.get(`/guides/${id}`),
  
  createGuide: (data: {
    title: string
    content: string
    destination?: string
    days?: number
    budget?: number
    tags?: string[]
  }) => api.post('/guides', data),
  
  updateGuide: (id: string, data: Partial<{
    title: string
    content: string
    destination?: string
    days?: number
    budget?: number
    tags?: string[]
  }>) => api.put(`/guides/${id}`, data),
  
  deleteGuide: (id: string) => api.delete(`/guides/${id}`)
}

export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  
  updateProfile: (data: {
    username?: string
    avatar?: string
  }) => api.put('/user/profile', data),
  
  getQuota: () => api.get('/user/quota')
}
