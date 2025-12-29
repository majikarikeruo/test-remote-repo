export interface Article {
  id?: string
  url: string
  title: string
  content: string
  excerpt: string
  siteName?: string
  tags: string[]
  memo: string
  isRead: boolean
  createdAt: string
  updatedAt: string
}
