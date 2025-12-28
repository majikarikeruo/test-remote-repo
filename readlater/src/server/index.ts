import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { articlesRouter } from './routes/articles.js'
import { authMiddleware } from './lib/auth.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('/api/*', cors())

// 認証（個人用簡易パスワード）
app.use('/api/*', authMiddleware)

// API Routes
app.route('/api/articles', articlesRouter)

// Health check
app.get('/api/health', (c) => c.json({ status: 'ok' }))

// 本番環境では静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist/client' }))
  app.get('*', serveStatic({ path: './dist/client/index.html' }))
}

const port = parseInt(process.env.PORT || '3000')

console.log(`Server running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port,
})
