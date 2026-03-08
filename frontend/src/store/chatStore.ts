import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Message } from '@/types/chat'

interface ChatStore {
  messages: Message[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
  
  // 消息操作
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
  
  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSessionId: (id: string | null) => void
  
  // 会话操作
  reset: () => void
}

/**
 * 聊天状态管理Store
 * 使用Zustand进行状态管理，支持持久化
 */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      messages: [],
      currentSessionId: null,
      isLoading: false,
      error: null,
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, {
          ...message,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        }]
      })),
      
      updateLastMessage: (content) => set((state) => {
        const messages = [...state.messages]
        const lastMessage = messages[messages.length - 1]
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content = content
        }
        return { messages }
      }),
      
      clearMessages: () => set({ messages: [], error: null }),
      
      setMessages: (messages) => set({ messages }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      setError: (error) => set({ error }),
      
      setSessionId: (id) => set({ currentSessionId: id }),
      
      reset: () => set({
        messages: [],
        currentSessionId: null,
        isLoading: false,
        error: null
      })
    }),
    {
      name: 'chat-storage',
      // 只持久化会话ID，消息从服务器加载
      partialize: (state) => ({
        currentSessionId: state.currentSessionId
      })
    }
  )
)
