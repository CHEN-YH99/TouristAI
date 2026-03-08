'use client'

import { useState, useCallback } from 'react'
import { getToken } from '@/lib/auth'

/**
 * 流式输出Hook
 * 用于处理Server-Sent Events (SSE)流式响应
 * 
 * @example
 * const { isStreaming, content, startStream, error } = useStream()
 * 
 * await startStream(
 *   '/api/chat/stream',
 *   { message: 'Hello' },
 *   (chunk) => console.log(chunk)
 * )
 */
export function useStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const startStream = useCallback(async (
    url: string,
    data: any,
    onChunk?: (chunk: string) => void,
    onComplete?: () => void
  ) => {
    setIsStreaming(true)
    setContent('')
    setError(null)

    try {
      const token = getToken()
      if (!token) {
        throw new Error('未登录，请先登录')
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

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
              onComplete?.()
              continue
            }
            
            try {
              const json = JSON.parse(data)
              
              // 处理错误响应
              if (json.error) {
                throw new Error(json.error)
              }
              
              const text = json.content || ''
              setContent(prev => prev + text)
              onChunk?.(text)
            } catch (e) {
              if (e instanceof Error && e.message !== data) {
                console.error('解析错误:', e)
                throw e
              }
            }
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '发生未知错误'
      setError(errorMessage)
      console.error('流式输出错误:', error)
      throw error
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setContent('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return { isStreaming, content, error, startStream, reset }
}
