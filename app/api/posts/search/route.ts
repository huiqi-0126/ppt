import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '6')
  
  if (!query) {
    return NextResponse.json({ posts: [], hasMore: false })
  }

  try {
    // 读取 posts.json 文件
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const allPosts = JSON.parse(fileContent)

    // 将搜索关键词按空格分词，并过滤掉空字符串
    const keywords = query.toLowerCase().split(/\s+/).filter(Boolean)

    // 搜索逻辑
    const searchResults = allPosts.filter((post: any) => {
      // 对每个关键词进行匹配
      return keywords.some(keyword => {
        const contentMatch = post.content?.toLowerCase().includes(keyword)
        const tagsMatch = post.tags?.some((tag: string) => 
          tag.toLowerCase().includes(keyword)
        )
        const titleMatch = post.title?.toLowerCase().includes(keyword)
        
        return contentMatch || tagsMatch || titleMatch
      })
    })

    // 对搜索结果进行排序：包含更多关键词的排在前面
    const sortedResults = searchResults.sort((a: any, b: any) => {
      const scoreA = getMatchScore(a, keywords)
      const scoreB = getMatchScore(b, keywords)
      return scoreB - scoreA
    })

    // 分页处理
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedResults = sortedResults.slice(start, end)
    const hasMore = end < sortedResults.length

    return NextResponse.json({
      posts: paginatedResults,
      hasMore,
      total: sortedResults.length
    })

  } catch (error) {
    console.error('搜索失败:', error)
    return NextResponse.json(
      { error: '搜索失败', details: error instanceof Error ? error.message : '未知错误' },
      { status: 500 }
    )
  }
}

// 计算匹配分数：匹配的关键词数量
function getMatchScore(post: any, keywords: string[]): number {
  let score = 0
  
  keywords.forEach(keyword => {
    // 标题匹配权重最高
    if (post.title?.toLowerCase().includes(keyword)) {
      score += 3
    }
    // 标签匹配其次
    if (post.tags?.some((tag: string) => tag.toLowerCase().includes(keyword))) {
      score += 2
    }
    // 内容匹配权重最低
    if (post.content?.toLowerCase().includes(keyword)) {
      score += 1
    }
  })
  
  return score
} 