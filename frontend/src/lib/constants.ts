// API配置常量
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const

// 路由常量
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  GUIDES: '/guides',
  GUIDE_DETAIL: (id: string) => `/guides/${id}`,
  PROFILE: '/profile',
} as const

// 用户配额常量
export const QUOTA = {
  FREE_DAILY_LIMIT: 5,
  BASIC_DAILY_LIMIT: 30,
  PREMIUM_DAILY_LIMIT: -1, // 无限制
} as const

// 本地存储键
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  THEME: 'theme',
} as const

// 消息类型
export const MESSAGE_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const

// 会员类型
export const MEMBERSHIP_TYPES = {
  FREE: 'free',
  BASIC: 'basic',
  PREMIUM: 'premium',
} as const
