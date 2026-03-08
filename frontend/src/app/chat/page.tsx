'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/store/chatStore'
import { useStream } from '@/hooks/useStream'
import { ChatInput } from '@/components/chat/ChatInput'
import { MessageList } from '@/components/chat/MessageList'
import { Button } from '@/components/ui/Button'
import { isAuthenticated } from '@/lib/auth'
import { userAPI } from '@/lib/api'
import { AlertCircle, Save } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export default function ChatPage() {
  const router = useRouter()
  const { 
    messages, 
    addMessage, 
    updateLastMessage, 
    isLoading, 
    setLoading,
    error: chatError,
    setError
  } = useChatStore()
  const { startStream, error: streamError } = useStream()
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null)
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    
    // 加载用户配额
    loadQuota()
  }, [router])

  // 检查是否有完整对话可以保存
  useEffect(() => {
    const hasCompleteConversation = messages.length >= 2 && 
      messages[messages.length - 1].role === 'assistant' &&
      messages[messages.length - 1].content.length > 100
    setShowSavePrompt(hasCompleteConversation && !isLoading)
  }, [messages, isLoading])

  const loadQuota = async () => {
    try {
      const response = await userAPI.getQuota()
      setQuota(response.data)
    } catch (error) {
      console.error('加载配额失败:', error)
    }
  }

  const handleSend = async (message: string) => {
    // 检查配额
    if (quota && quota.used >= quota.limit) {
      setError('今日对话次数已用完，请明天再试或升级会员')
      return
    }

    setError(null)
    addMessage({ role: 'user', content: message })
    addMessage({ role: 'assistant', content: '' })
    setLoading(true)

    try {
      let fullContent = ''
      await startStream(
        `${API_URL}/chat/stream`,
        { 
          message,
          history: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        },
        (chunk) => {
          fullContent += chunk
          updateLastMessage(fullContent)
        },
        () => {
          // 对话完成，刷新配额
          loadQuota()
        }
      )
    } catch (error) {
      console.error('对话错误:', error)
      const errorMessage = error instanceof Error ? error.message : '抱歉，发生了错误，请稍后重试'
      updateLastMessage(`❌ ${errorMessage}`)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGuide = () => {
    // 提取最后一条AI回复作为攻略内容
    const lastAssistantMessage = messages
      .filter(m => m.role === 'assistant')
      .pop()
    
    if (lastAssistantMessage) {
      // 跳转到保存页面，携带内容
      const content = encodeURIComponent(lastAssistantMessage.content)
      router.push(`/guides/new?content=${content}`)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b p-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">TouristAI</h1>
          {quota && (
            <div className="text-sm text-gray-600">
              今日对话: {quota.used}/{quota.limit}
            </div>
          )}
        </div>
      </header>

      {/* Error Alert */}
      {(chatError || streamError) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{chatError || streamError}</p>
          </div>
        </div>
      )}

      {/* Save Prompt */}
      {showSavePrompt && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 m-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-700">生成了完整的攻略，要保存吗？</p>
            <Button
              size="sm"
              onClick={handleSaveGuide}
              className="gap-2"
            >
              <Save size={16} />
              保存攻略
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
