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
      <div className="bg-white rounded-lg p-8 text-center text-gray-500">
        記事がありません
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {articles.map((article) => (
        <div
          key={article.id}
          className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 cursor-pointer ${
            article.isRead ? 'opacity-60' : ''
          }`}
        >
          <div className="flex">
            {article.ogImage && (
              <div className="w-32 h-24 flex-shrink-0">
                <img
                  src={article.ogImage}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
            <div className="flex-1 p-4 min-w-0" onClick={() => onSelect(article)}>
              <h3 className="font-medium text-gray-900 line-clamp-1">{article.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {article.siteName && (
                  <span className="text-xs text-gray-400">{article.siteName}</span>
                )}
                {article.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleRead(article.id!, !article.isRead)
              }}
              className={`px-2 py-1 rounded ${
                article.isRead ? 'text-gray-500' : 'text-green-600'
              }`}
            >
              {article.isRead ? '既読' : '未読'}
            </button>
            <div className="flex items-center gap-3">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:underline"
              >
                開く
              </a>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(article.id!)
                }}
                className="text-red-500 hover:text-red-600"
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
