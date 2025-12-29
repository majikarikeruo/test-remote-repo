import { useState, useEffect, useCallback } from 'react'
import { ArticleList } from './components/ArticleList'
import { ArticleForm } from './components/ArticleForm'
import { ArticleDetail } from './components/ArticleDetail'
import { SearchBar } from './components/SearchBar'
import { TagFilter } from './components/TagFilter'
import { LoginForm } from './components/LoginForm'
import type { Article } from './types'

const API_BASE = '/api'

export default function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState<string>(() =>
    localStorage.getItem('readlater_password') || ''
  )
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(password ? { 'Authorization': `Bearer ${password}` } : {}),
  }), [password])

  // 記事一覧を取得
  const fetchArticles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (selectedTag) params.set('tag', selectedTag)
      if (searchQuery) params.set('search', searchQuery)

      const res = await fetch(`${API_BASE}/articles?${params}`, { headers: headers() })
      if (res.status === 401) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to fetch articles')

      const data = await res.json()
      setArticles(data)
      setIsAuthenticated(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }, [selectedTag, searchQuery, headers])

  // タグ一覧を取得
  const fetchTags = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/articles/meta/tags`, { headers: headers() })
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      }
    } catch (e) {
      console.error('Failed to fetch tags:', e)
    }
  }, [headers])

  useEffect(() => {
    fetchArticles()
    fetchTags()
  }, [fetchArticles, fetchTags])

  // 記事を追加
  const addArticle = async (url: string, articleTags: string[], memo: string) => {
    try {
      const res = await fetch(`${API_BASE}/articles`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ url, tags: articleTags, memo }),
      })
      if (!res.ok) throw new Error('Failed to add article')

      await fetchArticles()
      await fetchTags()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  // 記事を更新
  const updateArticle = async (id: string, updates: Partial<Article>) => {
    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error('Failed to update article')

      await fetchArticles()
      await fetchTags()

      if (selectedArticle?.id === id) {
        const updated = await res.json()
        setSelectedArticle(updated)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  // 記事を削除
  const deleteArticle = async (id: string) => {
    if (!confirm('削除しますか？')) return

    try {
      const res = await fetch(`${API_BASE}/articles/${id}`, {
        method: 'DELETE',
        headers: headers(),
      })
      if (!res.ok) throw new Error('Failed to delete article')

      await fetchArticles()
      await fetchTags()

      if (selectedArticle?.id === id) {
        setSelectedArticle(null)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  const handleLogin = (pwd: string) => {
    setPassword(pwd)
    localStorage.setItem('readlater_password', pwd)
  }

  if (!isAuthenticated && !isLoading) {
    return <LoginForm onLogin={handleLogin} error={error} />
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">ReadLater</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左サイドバー: 記事追加 & フィルター */}
          <div className="space-y-4">
            <ArticleForm onSubmit={addArticle} existingTags={tags} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <TagFilter
              tags={tags}
              selectedTag={selectedTag}
              onSelect={setSelectedTag}
            />
          </div>

          {/* メイン: 記事一覧 */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">読み込み中...</div>
            ) : (
              <ArticleList
                articles={articles}
                onSelect={setSelectedArticle}
                onToggleRead={(id, isRead) => updateArticle(id, { isRead })}
                onDelete={deleteArticle}
              />
            )}
          </div>
        </div>

        {/* 記事詳細モーダル */}
        {selectedArticle && (
          <ArticleDetail
            article={selectedArticle}
            onClose={() => setSelectedArticle(null)}
            onUpdate={(updates) => updateArticle(selectedArticle.id!, updates)}
            existingTags={tags}
          />
        )}
      </main>
    </div>
  )
}
