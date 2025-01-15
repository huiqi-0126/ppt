import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

interface Post {
  id: number
  title: string
  images: string[]
  views: number
  likes: number
  downloads: number
  shares: number
  tags: string[]
  author: string
  publishDate: string
  content: string
}

export const dynamic = 'force-dynamic' // 强制动态渲染

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 6
    
    const filePath = path.join(process.cwd(), 'content.txt')
    const data = fs.readFileSync(filePath, 'utf-8')
    const allPosts = JSON.parse(data)
    
    if (id) {
      const post = allPosts.find((p: Post) => p.id === Number(id))
      if (post) {
        return NextResponse.json({
          ...post,
          publishDate: new Date().toISOString().split('T')[0],
          content: post.content || '默认内容'
        })
      }
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Sort posts by id descending (newest first)
    const sortedPosts = allPosts.sort((a: Post, b: Post) => b.id - a.id)
    
    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const posts = sortedPosts.slice(startIndex, endIndex)
    const hasMore = endIndex < allPosts.length
    
    return NextResponse.json({
      posts: posts.map((post: Post) => ({
        id: post.id,
        title: post.title,
        images: post.images,
        views: post.views,
        likes: post.likes,
        downloads: post.downloads,
        shares: post.shares,
        tags: post.tags,
        author: post.author
      })),
      hasMore
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
