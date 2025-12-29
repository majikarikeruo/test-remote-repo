import { useState } from 'react'
import type { Article } from '../types'

interface Props {
  article: Article
  onClose: () => void
  onUpdate: (updates: Partial<Article>) => Promise<void>
  existingTags: string[]
}

export function ArticleDetail({ article, onClose, onUpdate, existingTags }: Props) {
  const [isEditingTags, setIsEditingTags] = useState(false)
  const [isEditingMemo, setIsEditingMemo] = useState(false)
  const [tagInput, setTagInput] = useState(article.tags.join(', '))
  const [memo, setMemo] = useState(article.memo)

  const handleSaveTags = async () => {
    const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
    await onUpdate({ tags })
    setIsEditingTags(false)
  }

  const handleSaveMemo = async () => {
    await onUpdate({ memo })
    setIsEditingMemo(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="p-4 border-b flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{article.title}</h2>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline break-all"
            >
              {article.url}
            </a>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* タグ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">タグ</h3>
              {!isEditingTags && (
                <button
                  onClick={() => setIsEditingTags(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </button>
              )}
            </div>
            {isEditingTags ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="タグ（カンマ区切り）"
                />
                <div className="flex flex-wrap gap-1">
                  {existingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
                        if (!tags.includes(tag)) {
                          setTagInput(tags.length ? `${tagInput}, ${tag}` : tag)
                        }
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveTags}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setTagInput(article.tags.join(', '))
                      setIsEditingTags(false)
                    }}
                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {article.tags.length > 0 ? (
                  article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm">タグなし</span>
                )}
              </div>
            )}
          </div>

          {/* メモ */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-700">メモ</h3>
              {!isEditingMemo && (
                <button
                  onClick={() => setIsEditingMemo(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  編集
                </button>
              )}
            </div>
            {isEditingMemo ? (
              <div className="space-y-2">
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md resize-none"
                  rows={3}
                  placeholder="メモを入力..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveMemo}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setMemo(article.memo)
                      setIsEditingMemo(false)
                    }}
                    className="px-3 py-1 bg-gray-200 rounded text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-sm whitespace-pre-wrap">
                {article.memo || <span className="text-gray-400">メモなし</span>}
              </p>
            )}
          </div>

          {/* 本文 */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">本文</h3>
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
