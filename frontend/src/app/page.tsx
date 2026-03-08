import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { MessageSquare, BookOpen, Sparkles, Zap, Globe, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            TouristAI
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            AI智能旅游攻略生成平台
          </p>
          <p className="text-lg text-gray-500 mb-12">
            通过对话方式获取个性化旅游建议和完整攻略
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/chat">
              <Button size="lg" className="gap-2">
                <MessageSquare size={20} />
                开始对话
              </Button>
            </Link>
            <Link href="/guides">
              <Button variant="outline" size="lg" className="gap-2">
                <BookOpen size={20} />
                查看攻略
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">核心功能</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold">AI智能对话</h3>
                  <p className="text-gray-600">
                    与AI实时对话，获取个性化的旅游建议和完整攻略
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Zap className="h-8 w-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold">即时生成</h3>
                  <p className="text-gray-600">
                    流式输出，实时查看AI生成的攻略内容
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <BookOpen className="h-8 w-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold">攻略管理</h3>
                  <p className="text-gray-600">
                    保存、查看和管理你的所有旅游攻略
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">为什么选择TouristAI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">个性化定制</h3>
                <p className="text-gray-600">
                  根据你的预算、时间和兴趣，生成专属旅游攻略
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">专业建议</h3>
                <p className="text-gray-600">
                  基于AI大模型，提供专业的旅游规划建议
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">快速高效</h3>
                <p className="text-gray-600">
                  几分钟内生成完整的旅游攻略，节省大量时间
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Shield className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">安全可靠</h3>
                <p className="text-gray-600">
                  数据加密存储，保护你的隐私和信息安全
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            开始你的智能旅游规划之旅
          </h2>
          <p className="text-xl text-white/90 mb-8">
            立即注册，免费体验AI生成旅游攻略
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              免费注册
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
