import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// TypeScript类型定义
export interface LoginResponse {
  accessToken: string
  user: {
    id: string
    email: string
    username: string
  }
}

export interface RegisterResponse {
  accessToken: string
  user: {
    id: string
    email: string
    username: string
  }
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface Guide {
  id: string
  title: string
  content: string
  destination?: string
  days?: number
  budget?: number
  tags?: string[]
  viewCount: number
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
}

export interface UserQuota {
  dailyLimit: number
  usedToday: number
  remaining: number
  resetAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

/**
 * Axios实例配置（增强版）
 * 
 * 功能特性：
 * - 自动添加认证token
 * - 统一错误处理和拦截
 * - 请求超时配置
 * - 请求重试机制
 * - 请求/响应日志
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
})

// 请求队列（用于token刷新时暂存请求）
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (reason?: any) => void
}> = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// 请求拦截器：添加认证token和请求日志
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 开发环境下打印请求日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器：统一错误处理和token刷新
api.interceptors.response.use(
  (response) => {
    // 开发环境下打印响应日志
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.config.url}`, response.data)
    }
    return response
  },
  async (error: AxiosError<{ message?: string }>) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // 401未授权：尝试刷新token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 如果正在刷新token，将请求加入队列
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // 尝试刷新token
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          })
          const { accessToken } = response.data
          localStorage.setItem('access_token', accessToken)
          
          processQueue(null, accessToken)
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`
          }
          return api(originalRequest)
        }
      } catch (refreshError) {
        processQueue(new Error('Token刷新失败'), null)
        // Token刷新失败，清除本地数据并跳转登录
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(new Error('登录已过期，请重新登录'))
      } finally {
        isRefreshing = false
      }
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

    // 503服务不可用
    if (error.response?.status === 503) {
      return Promise.reject(new Error('服务暂时不可用，请稍后再试'))
    }

    // 网络错误
    if (!error.response) {
      return Promise.reject(new Error('网络连接失败，请检查网络'))
    }

    // 超时错误
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('请求超时，请稍后再试'))
    }

    // 其他错误：使用服务器返回的错误信息
    const message = error.response?.data?.message || '请求失败'
    console.error('[API Error]', error.response?.status, message)
    return Promise.reject(new Error(message))
  }
)

/**
 * 认证API
 */
export const authAPI = {
  /**
   * 用户登录
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password })
    return response.data
  },
  
  /**
   * 用户注册
   */
  register: async (email: string, username: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', { 
      email, 
      username, 
      password 
    })
    return response.data
  },
  
  /**
   * 刷新Token
   */
  refreshToken: async (): Promise<{ accessToken: string }> => {
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) {
      throw new Error('未找到刷新令牌')
    }
    const response = await api.post<{ accessToken: string }>('/auth/refresh', { refreshToken })
    return response.data
  },
  
  /**
   * 用户登出
   */
  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }
}

/**
 * 对话API
 */
export const chatAPI = {
  /**
   * 获取所有会话
   */
  getSessions: async (): Promise<ChatSession[]> => {
    const response = await api.get<ChatSession[]>('/chat/sessions')
    return response.data
  },
  
  /**
   * 获取单个会话详情
   */
  getSession: async (sessionId: string): Promise<ChatSession> => {
    const response = await api.get<ChatSession>(`/chat/sessions/${sessionId}`)
    return response.data
  },
  
  /**
   * 创建新会话
   */
  createSession: async (title: string): Promise<ChatSession> => {
    const response = await api.post<ChatSession>('/chat/sessions', { title })
    return response.data
  },
  
  /**
   * 删除会话
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/chat/sessions/${sessionId}`)
  },
  
  /**
   * 获取会话历史消息
   */
  getHistory: async (sessionId: string): Promise<any[]> => {
    const response = await api.get(`/chat/sessions/${sessionId}/messages`)
    return response.data
  }
}

/**
 * 攻略API
 */
export const guideAPI = {
  /**
   * 获取所有攻略（分页）
   */
  findAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Guide>> => {
    const response = await api.get<PaginatedResponse<Guide>>('/guides', {
      params: { page, limit }
    })
    return response.data
  },
  
  /**
   * 获取单个攻略
   */
  findOne: async (id: string): Promise<Guide> => {
    const response = await api.get<Guide>(`/guides/${id}`)
    return response.data
  },
  
  /**
   * 创建攻略
   */
  create: async (data: {
    title: string
    content: string
    destination?: string
    days?: number
    budget?: number
    tags?: string[]
  }): Promise<Guide> => {
    const response = await api.post<Guide>('/guides', data)
    return response.data
  },
  
  /**
   * 更新攻略
   */
  update: async (id: string, data: Partial<{
    title: string
    content: string
    destination?: string
    days?: number
    budget?: number
    tags?: string[]
  }>): Promise<Guide> => {
    const response = await api.put<Guide>(`/guides/${id}`, data)
    return response.data
  },
  
  /**
   * 删除攻略
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/guides/${id}`)
  },
  
  /**
   * 搜索攻略
   */
  search: async (keyword: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Guide>> => {
    const response = await api.get<PaginatedResponse<Guide>>('/guides/search', {
      params: { keyword, page, limit }
    })
    return response.data
  },
  
  /**
   * 增加浏览次数
   */
  incrementViewCount: async (id: string): Promise<void> => {
    await api.post(`/guides/${id}/view`)
  }
}

/**
 * 用户API
 */
export const userAPI = {
  /**
   * 获取用户信息
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/user/profile')
    return response.data
  },
  
  /**
   * 更新用户信息
   */
  updateProfile: async (data: {
    username?: string
    avatar?: string
  }): Promise<UserProfile> => {
    const response = await api.put<UserProfile>('/user/profile', data)
    return response.data
  },
  
  /**
   * 获取用户配额
   */
  getQuota: async (): Promise<UserQuota> => {
    const response = await api.get<UserQuota>('/user/quota')
    return response.data
  },
  
  /**
   * 刷新用户配额（手动触发）
   */
  refreshQuota: async (): Promise<UserQuota> => {
    const response = await api.post<UserQuota>('/user/quota/refresh')
    return response.data
  }
}
