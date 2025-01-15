const { createClient } = require('@supabase/supabase-js')
function encodeId(id) {
  return Buffer.from(id.toString()).toString('base64')
}
const fs = require('fs')

const supabaseUrl = 'https://uhwbwymfcblzwpecnupa.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVod2J3eW1mY2JsendwZWNudXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODAzNzQsImV4cCI6MjA1MjA1NjM3NH0.48rG1Pi65pxIBFEw-6GnUF2uObBa79r5fAW_LZ9q_m8'

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateSitemap() {
  try {
    // 获取所有posts数据
    const { data: posts, error } = await supabase
      .from('posts')
      .select('id')
      .order('id', { ascending: false })

    if (error) throw error

    if (!posts || posts.length === 0) {
      console.error('No posts found in the database.')
      return
    }

    // 生成sitemap XML内容
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ppt.guokecs.cn/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://ppt.guokecs.cn/privacy</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://ppt.guokecs.cn/terms</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`

    // 添加每个文章的URL
    posts.forEach(post => {
      xml += `
  <url>
    <loc>https://ppt.guokecs.cn/posts/${post.id}?id=${encodeId(post.id)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    })

    xml += '\n</urlset>'

    // 保存sitemap.xml文件
    fs.writeFileSync('public/sitemap.xml', xml)
    console.log('Sitemap generated successfully!')

  } catch (error) {
    console.error('Error generating sitemap:', error.message)
  }
}

generateSitemap()
