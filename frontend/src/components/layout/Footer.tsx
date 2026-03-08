'use client'

import Link from 'next/link'
import { Github, Twitter, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              TouristAI
            </h3>
            <p className="text-sm text-gray-600">
              AI智能旅游攻略生成平台
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">产品</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/chat" className="hover:text-blue-500 transition-colors">AI对话</Link></li>
              <li><Link href="/guides" className="hover:text-blue-500 transition-colors">攻略管理</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">会员服务</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">资源</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">使用指南</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">API文档</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">常见问题</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">关于</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">关于我们</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">隐私政策</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">服务条款</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
          <p>&copy; {currentYear} TouristAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
