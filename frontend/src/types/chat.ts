export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  messageCount?: number
}

export interface ChatRequest {
  message: string
  sessionId?: string
  context?: {
    destination?: string
    days?: number
    budget?: number
  }
}
