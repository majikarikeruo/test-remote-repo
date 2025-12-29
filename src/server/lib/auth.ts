import { Context, Next } from 'hono'
import { HTTPException } from 'hono/http-exception'

// 個人用の簡易パスワード認証
// 環境変数 AUTH_PASSWORD で設定
export async function authMiddleware(c: Context, next: Next) {
  const authPassword = process.env.AUTH_PASSWORD

  // パスワードが設定されていない場合はスキップ（開発用）
  if (!authPassword) {
    await next()
    return
  }

  // Authorizationヘッダーからトークンを取得
  const authHeader = c.req.header('Authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  if (token !== authPassword) {
    throw new HTTPException(401, { message: 'Invalid password' })
  }

  await next()
}
