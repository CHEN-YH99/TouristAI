'use client'

import { useState, KeyboardEvent, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  maxLength?: number
  autoFocus?: boolean
}

/**
 * 聊天输入组件（增强版）
 * 
 * 功能特性：
 * - 多行输入支持（textarea）
 * - 快捷键支持（Enter发送、Shift+Enter换行）
 * - 字符计数（最多500字）
 * - 自动高度调整（最多5行）
 * - 加载状态显示
 * - 输入验证（非空检查）
 * - 自动聚焦
 * - 响应式设计
 * 
 * @example
 * <ChatInput
 *   onSend={(msg) => console.log(msg)}
 *   disabled={isLoading}
 *   maxLength={500}
 *   autoFocus
 * />
 */
export function ChatInput({ 
  onSend, 
  disabled = false,
  placeholder = '输入你的旅行需求...',
  maxLength = 500,
  autoFocus = true
}: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自动聚焦
  useEffect(() => {
    if (autoFocus && textareaRef.current && !disabled) {
      textareaRef.current.focus()
    }
  }, [autoFocus, disabled])

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      const scrollHeight = textareaRef.current.scrollHeight
      const maxHeight = 120 // 约5行
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedInput = input.trim()
    
    if (trimmedInput && !disabled) {
      onSend(trimmedInput)
      setInput('')
      
      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter发送，Shift+Enter换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // 限制字符数
    if (value.length <= maxLength) {
      setInput(value)
    }
  }

  const charCount = input.length
  const isOverLimit = charCount > maxLength * 0.9 // 超过90%显示警告色
  const canSend = input.trim().length > 0 && !disabled

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col gap-2 p-4 border-t bg-white shadow-lg"
    >
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3 pr-16 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 
              resize-none transition-all
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${disabled ? 'opacity-60' : ''}
            `}
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
            aria-label="消息输入框"
          />
          
          {/* 字符计数 */}
          <div 
            className={`
              absolute right-3 bottom-3 text-xs
              ${isOverLimit ? 'text-orange-500 font-medium' : 'text-gray-400'}
            `}
          >
            {charCount}/{maxLength}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={!canSend}
          className={`
            px-6 py-3 rounded-lg transition-all
            flex items-center justify-center gap-2
            min-w-[100px] sm:min-w-[120px]
            ${canSend 
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
          title={disabled ? '正在生成中...' : '发送消息 (Enter)'}
          aria-label={disabled ? '正在生成中' : '发送消息'}
        >
          {disabled ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span className="hidden sm:inline font-medium">发送中...</span>
              <span className="sm:hidden font-medium">...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span className="font-medium">发送</span>
            </>
          )}
        </button>
      </div>
      
      {/* 提示信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          按 <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border">Enter</kbd> 发送，
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border ml-1">Shift + Enter</kbd> 换行
        </span>
        {disabled && (
          <span className="text-blue-500 animate-pulse">AI正在思考中...</span>
        )}
      </div>
    </form>
  )
}
