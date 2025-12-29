import { useState } from 'react'

interface Props {
  onSubmit: (url: string, tags: string[], memo: string) => Promise<void>
  existingTags: string[]
}

export function ArticleForm({ onSubmit, existingTags }: Props) {
  const [url, setUrl] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [memo, setMemo] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    try {
      const tags = tagInput.split(',').map((t) => t.trim()).filter(Boolean)
      await onSubmit(url.trim(), tags, memo.trim())
      setUrl('')
      setTagInput('')
      setMemo('')
      setIsExpanded(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="font-medium text-gray-900 mb-3">記事を追加</h2>
      <div className="space-y-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="URLを入力"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
          required
        />

        {!isExpanded && url && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-sm text-blue-600"
          >
            + タグ・メモを追加
          </button>
        )}

        {isExpanded && (
          <>
            <div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="タグ（カンマ区切り）"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm"
              />
              {existingTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {existingTags.slice(0, 8).map((tag) => (
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
              )}
            </div>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="メモ"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 text-sm resize-none"
            />
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  )
}
