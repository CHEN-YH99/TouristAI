'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-4 mb-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-bold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-bold mt-2 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-3">
            <table className="min-w-full border-collapse border">{children}</table>
          </div>
        ),
        code: ({ inline, children }: any) => (
          inline ? (
            <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">{children}</code>
          ) : (
            <pre className="bg-gray-200 p-3 rounded-lg overflow-x-auto mb-3">
              <code>{children}</code>
            </pre>
          )
        )
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
