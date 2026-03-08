'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { Guide } from '@/types/guide'
import { MarkdownRenderer } from '@/components/guide/MarkdownRenderer'
import { ArrowLeft, Download, Share2, Trash2 } from 'lucide-react'

export default function GuideDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }

    loadGuide()
  }, [params.id, router])

  const loadGuide = async () => {
    try {
      const response = await api.get<Guide>(`/guides/${params.id}`)
      setGuide(response.data)
    } catch (error) {
      console.error('Failed to load guide:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个攻略吗？')) return

    try {
      await api.delete(`/guides/${params.id}`)
      router.push('/guides')
    } catch (error) {
      console.error('Failed to delete guide:', error)
      alert('删除失败，请稍后重试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    )
  }

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>攻略不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <Link
            href="/guides"
            className="inline-flex items-center text-blue-500 hover:underline"
          >
            <ArrowLeft size={20} className="mr-1" />
            返回列表
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{guide.title}</h1>
              {guide.destination && (
                <p className="text-gray-600">📍 {guide.destination}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert('导出功能开发中')}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="导出"
              >
                <Download size={20} />
              </button>
              <button
                onClick={() => alert('分享功能开发中')}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="分享"
              >
                <Share2 size={20} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 border border-red-300 text-red-500 rounded-lg hover:bg-red-50"
                title="删除"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 text-sm text-gray-500 mb-6">
            {guide.days && <span>🗓️ {guide.days}天</span>}
            {guide.budget && <span>💰 ¥{guide.budget}</span>}
            <span>📅 {new Date(guide.createdAt).toLocaleDateString()}</span>
          </div>

          {guide.tags && guide.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {guide.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="prose max-w-none">
            <MarkdownRenderer content={guide.content} />
          </div>
        </div>
      </div>
    </div>
  )
}
