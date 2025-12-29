import type { Article } from '../types'

interface Props {
  articles: Article[]
  onSelect: (article: Article) => void
  onToggleRead: (id: string, isRead: boolean) => void
  onDelete: (id: string) => void
}

export function ArticleList({ articles, onSelect, onToggleRead, onDelete }: Props) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        記事がありません。URLを追加してください。
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div
          key={article.id}
          className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow cursor-pointer ${
            article.isRead ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0" onClick={() => onSelect(article)}>
              <h3 className="font-medium text-gray-900 truncate">
                {article.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {article.siteName && (
                  <span className="text-xs text-gray-400">{article.siteName}</span>
                )}
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {article.memo && (
                  <span className="text-xs text-amber-600">📝 メモあり</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleRead(article.id!, !article.isRead)
                }}
                className={`text-sm px-2 py-1 rounded ${
                  article.isRead
                    ? 'bg-gray-100 text-gray-600'
                    : 'bg-green-100 text-green-700'
                }`}
                title={article.isRead ? '未読にする' : '既読にする'}
              >
                {article.isRead ? '既読' : '未読'}
              </button>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-sm text-blue-600 hover:underline"
              >
                開く
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(article.id!)
                }}
                className="text-sm text-red-600 hover:text-red-800"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
