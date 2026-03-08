'use client'

import { useState, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * 聊天输入组件
 * 支持回车发送、Shift+回车换行
 */
export function ChatInput({ 
  onSend, 
  disabled,
  placeholder = '告诉我你的旅行计划...'
}: ChatInputProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !disabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 回车发送，Shift+回车换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t bg-white">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[120px]"
        style={{
          height: 'auto',
          overflowY: input.split('\n').length > 3 ? 'auto' : 'hidden'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
        title={disabled ? '正在生成中...' : '发送消息 (Enter)'}
      >
        {disabled ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span className="hidden sm:inline">生成中</span>
          </>
        ) : (
          <>
            <Send size={20} />
            <span className="hidden sm:inline">发送</span>
          </>
        )}
      </button>
    </form>
  )
}
