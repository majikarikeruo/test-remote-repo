import { JSDOM } from 'jsdom'
import { Readability } from '@mozilla/readability'

export interface ParsedArticle {
  title: string
  content: string
  excerpt: string
  siteName?: string
}

export async function parseArticle(url: string): Promise<ParsedArticle> {
  // URLからHTMLを取得
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ReadLater/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()

  // JSDOMでパース
  const dom = new JSDOM(html, { url })
  const document = dom.window.document

  // Readabilityで本文抽出
  const reader = new Readability(document)
  const article = reader.parse()

  if (!article) {
    throw new Error('Failed to parse article content')
  }

  // excerptを生成（HTMLタグを除去して最初の200文字）
  const textContent = article.textContent || ''
  const excerpt = textContent.slice(0, 200).trim() + (textContent.length > 200 ? '...' : '')

  return {
    title: article.title || 'Untitled',
    content: article.content || '',
    excerpt,
    siteName: article.siteName || undefined,
  }
}
