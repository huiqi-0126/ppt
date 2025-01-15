import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { postId } = req.body

    const filePath = path.join(process.cwd(), 'data', 'posts.json')
    const fileData = fs.readFileSync(filePath, 'utf8')
    const posts = JSON.parse(fileData)

    const postIndex = posts.findIndex(post => String(post.id) === postId)
    if (postIndex !== -1) {
      posts[postIndex].downloads = (posts[postIndex].downloads || 0) + 1

      fs.writeFileSync(filePath, JSON.stringify(posts, null, 2))
      res.status(200).json({ success: true, downloads: posts[postIndex].downloads })
    } else {
      res.status(404).json({ success: false, message: 'Post not found' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
} 