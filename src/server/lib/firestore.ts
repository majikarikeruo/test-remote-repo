import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let db: Firestore

export function getDb(): Firestore {
  if (db) return db

  if (getApps().length === 0) {
    // Cloud Run環境ではデフォルト認証を使用
    // ローカル開発ではGOOGLE_APPLICATION_CREDENTIALS環境変数を設定
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      })
    } else if (process.env.FIREBASE_PROJECT_ID) {
      // Cloud Run環境
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      })
    } else {
      // 開発用: エミュレータまたはデフォルト
      initializeApp()
    }
  }

  db = getFirestore()
  return db
}

// 記事のデータ型
export interface Article {
  id?: string
  url: string
  title: string
  content: string        // 抽出した本文
  excerpt: string        // 要約（最初の200文字程度）
  siteName?: string
  ogImage?: string       // OG画像URL
  tags: string[]
  memo: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

// Firestoreのコレクション名
export const ARTICLES_COLLECTION = 'articles'
