import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface Post {
  id: number
  tags: string[]
}

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'posts.json')
    const fileContent = await fs.readFile(dataPath, 'utf-8')
    const posts: Post[] = JSON.parse(fileContent)

    // 获取所有标签组合
    const tagCombinations = posts.map(post => post.tags.sort().join(' '))
    
    // 去重
    const uniqueCombinations = Array.from(new Set(tagCombinations))
    
    // 随机选择5个不同的组合
    const selectedCombinations = []
    const combinationsCopy = [...uniqueCombinations]
    
    for (let i = 0; i < 5 && combinationsCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * combinationsCopy.length)
      selectedCombinations.push(combinationsCopy[randomIndex])
      combinationsCopy.splice(randomIndex, 1)
    }

    return NextResponse.json({ suggestions: selectedCombinations })
  } catch (error) {
    console.error('获取建议失败:', error)
    return NextResponse.json(
      { error: '获取建议失败' },
      { status: 500 }
    )
  }
} 