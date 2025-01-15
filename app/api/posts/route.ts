import { NextResponse } from 'next/server'
import { supabase } from '@/supabaseClient'

export interface Post {
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
    
    let { data: allPosts, error } = await supabase
      .from('posts')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) {
      throw error
    }
    
    if (!allPosts) {
      allPosts = []
    }
    
    if (id) {
      const { data: post, error: postError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', Number(id))
        .single()
      
      if (postError) {
        throw postError
      }
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
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
    
    // Calculate pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const posts = allPosts.slice(startIndex, endIndex)
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
