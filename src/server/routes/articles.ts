import { Hono } from 'hono'
import { getDb, Article, ARTICLES_COLLECTION } from '../lib/firestore.js'
import { parseArticle } from '../lib/parser.js'

export const articlesRouter = new Hono()

// 記事一覧取得
articlesRouter.get('/', async (c) => {
  const db = getDb()
  const tag = c.req.query('tag')
  const search = c.req.query('search')
  const isRead = c.req.query('isRead')

  let query = db.collection(ARTICLES_COLLECTION).orderBy('createdAt', 'desc')

  // タグでフィルタ
  if (tag) {
    query = query.where('tags', 'array-contains', tag)
  }

  // 既読/未読フィルタ
  if (isRead !== undefined) {
    query = query.where('isRead', '==', isRead === 'true')
  }

  const snapshot = await query.limit(100).get()
  let articles = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Article[]

  // テキスト検索（Firestoreは全文検索をサポートしていないのでクライアント側でフィルタ）
  if (search) {
    const searchLower = search.toLowerCase()
    articles = articles.filter(article =>
      article.title.toLowerCase().includes(searchLower) ||
      article.excerpt.toLowerCase().includes(searchLower) ||
      article.memo.toLowerCase().includes(searchLower) ||
      article.tags.some(t => t.toLowerCase().includes(searchLower))
    )
  }

  return c.json(articles)
})

// 記事詳細取得
articlesRouter.get('/:id', async (c) => {
  const db = getDb()
  const id = c.req.param('id')

  const doc = await db.collection(ARTICLES_COLLECTION).doc(id).get()

  if (!doc.exists) {
    return c.json({ error: 'Article not found' }, 404)
  }

  return c.json({ id: doc.id, ...doc.data() })
})

// 記事保存（URLから自動取得）
articlesRouter.post('/', async (c) => {
  const db = getDb()
  const body = await c.req.json<{ url: string; tags?: string[]; memo?: string }>()

  if (!body.url) {
    return c.json({ error: 'URL is required' }, 400)
  }

  try {
    // URLから記事を抽出
    const parsed = await parseArticle(body.url)

    const article: Omit<Article, 'id'> = {
      url: body.url,
      title: parsed.title || 'Untitled',
      content: parsed.content || '',
      excerpt: parsed.excerpt || '',
      siteName: parsed.siteName || '',
      ogImage: parsed.ogImage || '',
      tags: body.tags || [],
      memo: body.memo || '',
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const docRef = await db.collection(ARTICLES_COLLECTION).add(article)

    return c.json({ id: docRef.id, ...article }, 201)
  } catch (error) {
    console.error('Failed to parse article:', error)
    return c.json({ error: 'Failed to parse article' }, 500)
  }
})

// 記事更新（タグ、メモ、既読状態など）
articlesRouter.patch('/:id', async (c) => {
  const db = getDb()
  const id = c.req.param('id')
  const body = await c.req.json<Partial<Pick<Article, 'tags' | 'memo' | 'isRead'>>>()

  const docRef = db.collection(ARTICLES_COLLECTION).doc(id)
  const doc = await docRef.get()

  if (!doc.exists) {
    return c.json({ error: 'Article not found' }, 404)
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (body.tags !== undefined) updateData.tags = body.tags
  if (body.memo !== undefined) updateData.memo = body.memo
  if (body.isRead !== undefined) updateData.isRead = body.isRead

  await docRef.update(updateData)

  const updated = await docRef.get()
  return c.json({ id: updated.id, ...updated.data() })
})

// 記事削除
articlesRouter.delete('/:id', async (c) => {
  const db = getDb()
  const id = c.req.param('id')

  const docRef = db.collection(ARTICLES_COLLECTION).doc(id)
  const doc = await docRef.get()

  if (!doc.exists) {
    return c.json({ error: 'Article not found' }, 404)
  }

  await docRef.delete()

  return c.json({ success: true })
})

// 全タグ取得
articlesRouter.get('/meta/tags', async (c) => {
  const db = getDb()
  const snapshot = await db.collection(ARTICLES_COLLECTION).get()

  const tagSet = new Set<string>()
  snapshot.docs.forEach(doc => {
    const data = doc.data() as Article
    data.tags?.forEach(tag => tagSet.add(tag))
  })

  return c.json([...tagSet].sort())
})
