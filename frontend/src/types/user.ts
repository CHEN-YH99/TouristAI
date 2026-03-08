export interface User {
  id: string
  email: string
  username: string
  membershipType: 'free' | 'basic' | 'premium'
  dailyQuota: number
  usedQuota: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}
