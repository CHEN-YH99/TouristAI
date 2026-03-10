'use client'

import { useState, useCallback, useRef } from 'react'
import { getToken } from '@/lib/auth'

interface UseStreamOptions {
  onComplete?: (finalContent: string) => void
  onError?: (error: Error) => void
  timeout?: number
  maxRetries?: number
}

/**
 * 流式输出Hook（增强版）
 * 用于处理Server-Sent Events (SSE)流式响应
 * 
 * 功能特性：
 * - 支持流式数据接收和解析
 * - 自动错误处理和重试机制
 * - 支持请求中止（AbortController）
 * - 完善的回调函数支持
 * - 内存管理和资源清理
 * 
 * @example
 * const { isStreaming, content, error, startStream, reset } = useStream({
 *   onComplete: (content) => console.log('完成:', content),
 *   onError: (error) => console.error('错误:', error),
 *   timeout: 30000,
 *   maxRetries: 3
 * })
 * 
 * await startStream(
 *   '/api/chat/stream',
 *   { message: 'Hello' },
 *   (chunk) => console.log('接收:', chunk)
 * )
 */
export function useStream(options: UseStreamOptions = {}) {
  const {
    onComplete,
    onError,
    timeout = 30000,
    maxRetries = 3
  } = options

  const [isStreaming, setIsStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const retryCountRef = useRef(0)

  /**
   * 开始流式输出
   * @param url - API端点
   * @param data - 请求数据
   * @param onChunk - 每次接收到数据块时的回调
   */
  const startStream = useCallback(async (
    url: string,
    data: any,
    onChunk?: (chunk: string) => void
  ) => {
    // 如果正在流式输出，先中止
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setIsStreaming(true)
    setContent('')
    setError(null)
    retryCountRef.current = 0

    // 创建新的AbortController
    abortControllerRef.current = new AbortController()

    const attemptStream = async (retryCount: number): Promise<void> => {
      try {
        const token = getToken()
        if (!token) {
          throw new Error('未登录，请先登录')
        }

        // 创建超时Promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), timeout)
        })

        // 创建fetch Promise
        const fetchPromise = fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data),
          signal: abortControllerRef.current?.signal
        })

        // 竞速：超时或fetch完成
        const response = await Promise.race([fetchPromise, timeoutPromise])

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `请求失败: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error('无法读取响应流')
        }

        let buffer = ''
        let accumulatedContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          
          // 保留最后一个可能不完整的行
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                continue
              }
              
              try {
                const json = JSON.parse(data)
                
                // 处理错误响应
                if (json.error) {
                  throw new Error(json.error)
                }
                
                const text = json.content || ''
                accumulatedContent += text
                setContent(prev => prev + text)
                onChunk?.(text)
              } catch (e) {
                // 如果不是JSON，可能是纯文本
                if (data && data !== '[DONE]') {
                  accumulatedContent += data
                  setContent(prev => prev + data)
                  onChunk?.(data)
                }
              }
            }
          }
        }

        // 流式输出完成
        onComplete?.(accumulatedContent)
        
      } catch (err) {
        // 如果是中止错误，不处理
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        const error = err instanceof Error ? err : new Error('发生未知错误')
        
        // 重试逻辑
        if (retryCount < maxRetries && 
            (error.message.includes('网络') || error.message.includes('超时'))) {
          retryCountRef.current = retryCount + 1
          console.warn(`流式输出失败，正在重试 (${retryCount + 1}/${maxRetries})...`)
          
          // 指数退避
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
          return attemptStream(retryCount + 1)
        }

        // 重试失败或不可重试的错误
        const errorMessage = error.message
        setError(errorMessage)
        onError?.(error)
        console.error('流式输出错误:', error)
        throw error
      }
    }

    try {
      await attemptStream(0)
    } finally {
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }, [timeout, maxRetries, onComplete, onError])

  /**
   * 中止当前流式输出
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  /**
   * 重置所有状态
   */
  const reset = useCallback(() => {
    abort()
    setContent('')
    setError(null)
    retryCountRef.current = 0
  }, [abort])

  return { 
    isStreaming, 
    content, 
    error, 
    startStream, 
    abort,
    reset 
  }
}
