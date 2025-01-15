import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/supabaseClient'
import { log } from 'console'

interface Post {
  id: number
  title: string
  content: string
  tags: string[]
  // ... other fields
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')?.trim()
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '6')

  if (!query) {
    return NextResponse.json({ posts: [], hasMore: false })
  }

  try {
    // 将搜索关键词按空格分词，并过滤掉空字符串
    const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
    const tagConditions = keywords.map(keyword => `tags.ilike.%${keyword}%`).join(',');
    const searchConditions = `title.ilike.%${query}%,content.ilike.%${query}%`;
    //const searchConditions = `title.ilike.%${query}%,content.ilike.%${query}%,tags.cs.{${query}}`;


    console.log("完整的查询条件:", searchConditions);
    
    const { data: posts, count } = await supabase
     .from('posts')
     .select('*', { count: 'exact' })
     .or(searchConditions)
     .order('id', { ascending: true })
     .range((page - 1) * limit, page * limit - 1);   
    // const { data: posts, count } = await supabase
    // .from('posts')
    // .select()
    // .containedBy('tags', [''])
      

    console.log('组合查询结果:', posts)
    
    if (!posts || posts.length === 0) {
      return NextResponse.json({
        posts: [],
        hasMore: false,
        total: 0
      })
    }
    
    const hasMore = (count || 0) > page * limit

    return NextResponse.json({
      posts,
      hasMore,
      total: count
    })

  } catch (error) {
    console.error('搜索失败:', error)
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}
