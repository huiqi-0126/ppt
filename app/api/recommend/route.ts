import { NextResponse } from 'next/server'
import { supabase } from '@/supabaseClient'

export async function GET() {
  try {
    const page = 1
    const pageSize = 6
    
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data: recommendData, count, error } = await supabase
      .from('recommend')
      .select('*', { count: 'exact' })
      .order('id', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }
    // console.log("recommendData========",recommendData)
    return NextResponse.json({ 
      posts: recommendData || [] 
    })
  } catch (error) {
    console.error('获取推荐失败:', error)
    return NextResponse.json(
      { 
        error: '获取推荐失败',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
