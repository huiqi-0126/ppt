import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

// 从标签数组生成搜索建议
function generateSuggestion(tags: string[]): string {
  // 随机选择2-4个标签组合
  const count = Math.floor(Math.random() * 3) + 2 // 2到4之间的随机数
  const selectedTags = []
  const tagsCopy = [...tags]
  
  for (let i = 0; i < count && tagsCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * tagsCopy.length)
    selectedTags.push(tagsCopy[randomIndex])
    tagsCopy.splice(randomIndex, 1)
  }
  
  return selectedTags.join(' ')
}

export async function GET() {
  try {
    // 读取 posts.json 文件
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const posts = JSON.parse(fileContent)

    // 收集所有唯一的标签
    const allTags = new Set<string>()
    posts.forEach((post: any) => {
      post.tags?.forEach((tag: string) => allTags.add(tag))
    })
    
    // 将 Set 转换为数组
    const tagsArray = Array.from(allTags)
    
    // 生成5个随机建议
    const suggestions: string[] = []
    for (let i = 0; i < 6; i++) {
      suggestions.push(generateSuggestion(tagsArray))
    }

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error('获取建议失败:', error)
    return NextResponse.json(
      { error: '获取建议失败' },
      { status: 500 }
    )
  }
} 