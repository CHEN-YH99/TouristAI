import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { Message } from '@/types/chat'

interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface ChatStore {
  // 状态
  messages: Message[]
  sessions: ChatSession[]
  currentSessionId: string | null
  isLoading: boolean
  error: string | null
  
  // 消息操作
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  updateLastMessage: (content: string) => void
  deleteMessage: (messageId: string) => void
  clearMessages: () => void
  setMessages: (messages: Message[]) => void
  
  // 批量操作
  deleteMessages: (messageIds: string[]) => void
  
  // 会话操作
  setSessions: (sessions: ChatSession[]) => void
  addSession: (session: ChatSession) => void
  deleteSession: (sessionId: string) => void
  setCurrentSession: (sessionId: string | null) => void
  
  // 状态管理
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // 重置
  reset: () => void
  resetMessages: () => void
}

/**
 * 聊天状态管理Store（增强版）
 * 
 * 功能特性：
 * - 使用Zustand进行状态管理
 * - 支持持久化（localStorage）
 * - 支持Redux DevTools调试
 * - 完善的消息和会话管理
 * - 批量操作支持
 * - 错误状态管理
 * 
 * @example
 * const { messages, addMessage, setError } = useChatStore()
 */
export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        messages: [],
        sessions: [],
        currentSessionId: null,
        isLoading: false,
        error: null,
        
        // 添加消息
        addMessage: (message) => set((state) => {
          const newMessage: Message = {
            ...message,
            id: crypto.randomUUID(),
            timestamp: Date.now()
          }
          return {
            messages: [...state.messages, newMessage],
            error: null // 清除错误
          }
        }, false, 'addMessage'),
        
        // 更新最后一条消息（用于流式输出）
        updateLastMessage: (content) => set((state) => {
          const messages = [...state.messages]
          const lastMessage = messages[messages.length - 1]
          
          if (lastMessage && lastMessage.role === 'assistant') {
            lastMessage.content = content
          } else {
            // 如果最后一条不是助手消息，创建新消息
            messages.push({
              id: crypto.randomUUID(),
              role: 'assistant',
              content,
              timestamp: Date.now()
            })
          }
          
          return { messages }
        }, false, 'updateLastMessage'),
        
        // 删除单条消息
        deleteMessage: (messageId) => set((state) => ({
          messages: state.messages.filter(msg => msg.id !== messageId)
        }), false, 'deleteMessage'),
        
        // 批量删除消息
        deleteMessages: (messageIds) => set((state) => ({
          messages: state.messages.filter(msg => !messageIds.includes(msg.id))
        }), false, 'deleteMessages'),
        
        // 清空消息
        clearMessages: () => set({ 
          messages: [], 
          error: null 
        }, false, 'clearMessages'),
        
        // 设置消息列表
        setMessages: (messages) => set({ 
          messages,
          error: null 
        }, false, 'setMessages'),
        
        // 设置会话列表
        setSessions: (sessions) => set({ 
          sessions 
        }, false, 'setSessions'),
        
        // 添加会话
        addSession: (session) => set((state) => ({
          sessions: [session, ...state.sessions]
        }), false, 'addSession'),
        
        // 删除会话
        deleteSession: (sessionId) => set((state) => {
          const newState: Partial<ChatStore> = {
            sessions: state.sessions.filter(s => s.id !== sessionId)
          }
          
          // 如果删除的是当前会话，清空消息和会话ID
          if (state.currentSessionId === sessionId) {
            newState.currentSessionId = null
            newState.messages = []
          }
          
          return newState
        }, false, 'deleteSession'),
        
        // 设置当前会话
        setCurrentSession: (sessionId) => set({ 
          currentSessionId: sessionId,
          // 切换会话时清空消息（从服务器重新加载）
          messages: [],
          error: null
        }, false, 'setCurrentSession'),
        
        // 设置加载状态
        setLoading: (loading) => set({ 
          isLoading: loading 
        }, false, 'setLoading'),
        
        // 设置错误
        setError: (error) => set({ 
          error,
          isLoading: false // 出错时停止加载
        }, false, 'setError'),
        
        // 重置所有状态
        reset: () => set({
          messages: [],
          sessions: [],
          currentSessionId: null,
          isLoading: false,
          error: null
        }, false, 'reset'),
        
        // 仅重置消息
        resetMessages: () => set({
          messages: [],
          error: null
        }, false, 'resetMessages')
      }),
      {
        name: 'chat-storage',
        // 只持久化会话相关信息，消息从服务器加载
        partialize: (state) => ({
          currentSessionId: state.currentSessionId,
          sessions: state.sessions
        }),
        // 版本控制（用于迁移）
        version: 1,
        // 合并策略
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...persistedState,
          // 不持久化的状态使用默认值
          messages: [],
          isLoading: false,
          error: null
        })
      }
    ),
    {
      name: 'ChatStore',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
)

// 选择器（用于性能优化）
export const selectMessages = (state: ChatStore) => state.messages
export const selectCurrentSession = (state: ChatStore) => state.currentSessionId
export const selectError = (state: ChatStore) => state.error
export const selectIsLoading = (state: ChatStore) => state.isLoading
