'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
  }

  const styles = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300',
        styles[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      {icons[type]}
      <p className="flex-1">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(onClose, 300)
        }}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Toast管理器
class ToastManager {
  private listeners: Set<(toast: ToastProps) => void> = new Set()

  subscribe(listener: (toast: ToastProps) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  show(message: string, type: ToastType = 'info', duration?: number) {
    const toast: ToastProps = {
      message,
      type,
      duration,
      onClose: () => {},
    }
    this.listeners.forEach(listener => listener(toast))
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration)
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration)
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration)
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration)
  }
}

export const toast = new ToastManager()
