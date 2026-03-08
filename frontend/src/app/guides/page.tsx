'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { Guide } from '@/types/guide'

export default function GuidesPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    loadGuides()
  }, [router])

  const loadGuides = async () => {
    try {
      const response = await api.get<Guide[]>('/guides')
      setGuides(response.data)
    } catch (error) {
      console.error('Failed to load guides:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">我的攻略</h1>
          <Link
            href="/chat"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            创建新攻略
          </Link>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>还没有保存的攻略</p>
            <Link href="/chat" className="text-blue-500 hover:underline mt-2 inline-block">
              开始创建
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/guides/${guide.id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <h2 className="text-xl font-bold mb-2">{guide.title}</h2>
                {guide.destination && (
                  <p className="text-gray-600 mb-2">📍 {guide.destination}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                  {guide.days && <span>{guide.days}天</span>}
                  {guide.budget && <span>¥{guide.budget}</span>}
                </div>
                {guide.tags && guide.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {guide.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-4">
                  {new Date(guide.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
