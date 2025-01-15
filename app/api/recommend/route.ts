import { NextResponse } from 'next/server'
import { supabase } from '@/supabaseClient'

export async function GET() {
  try {
    const { data: recommendData, error } = await supabase
      .from('recommend')
      .select('*')
      .order('id', { ascending: false })

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
