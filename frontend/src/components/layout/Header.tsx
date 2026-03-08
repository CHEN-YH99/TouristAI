'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/userStore'
import { removeToken } from '@/lib/auth'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { LogOut, User, MessageSquare, BookOpen } from 'lucide-react'

export function Header() {
  const router = useRouter()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    removeToken()
    logout()
    router.push(ROUTES.LOGIN)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            TouristAI
          </span>
        </Link>

        <nav className="flex items-center space-x-6">
          {user ? (
            <>
              <Link
                href={ROUTES.CHAT}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors"
              >
                <MessageSquare size={18} />
                <span>对话</span>
              </Link>
              <Link
                href={ROUTES.GUIDES}
                className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 transition-colors"
              >
                <BookOpen size={18} />
                <span>攻略</span>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User size={16} />
                  <span>{user.username}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                    {user.usedQuota}/{user.dailyQuota}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-1"
                >
                  <LogOut size={16} />
                  <span>退出</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button size="sm">
                  注册
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
