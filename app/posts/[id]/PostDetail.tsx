"use client"

import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card } from "../../../components/ui/card"
import { Eye, ThumbsUp, Download, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

interface Post {
  id: number
  title: string
  author: string
  views: number
  likes: number
  downloads: number
  shares: number
  tags: string[]
  images: string[]
  content: string
  publishDate: string
}

export default function PostDetail({ params }: { params: { id: string } }) {
  const [currentImage, setCurrentImage] = useState(0)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts?id=${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch post')
        }
        const data = await response.json()
        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.id])

  if (loading) {
    return <div className="container py-6">加载中...</div>
  }

  if (error) {
    return <div className="container py-6 text-red-500">{error}</div>
  }

  if (!post) {
    return <div className="container py-6">未找到该作品</div>
  }

  return (
    <main className="container py-6">
      <article className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-3">
            <div className="flex gap-4 text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {post.views}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" /> {post.downloads}
              </span>
              <span className="flex items-center gap-1">
                <Share2 className="h-4 w-4" /> {post.shares}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              {post.author} · 发布于 {post.publishDate}
            </div>
            <div className="flex gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-4">
              <Button 
                size="xl" 
                className="w-[180px] py-3 flex flex-row items-center justify-center gap-2 rounded-lg hover:bg-primary/90 custom-tall-button"
                style={{ height: '56px' }}
              >
                <span className="text-base font-medium">点赞下载 · 还差9赞</span>
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="w-[180px] py-3 flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-secondary/90 custom-tall-button"
                style={{ height: '56px' }}
              >
                <span className="text-base font-medium">付费下载</span>
                <span className="text-[11px] font-normal">1.9元</span>
              </Button>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              分享给好友点赞，单个用户每天点赞一次
            </div>
          </div>
        </div>

        <Card className="relative mb-6">
          <img
            src={post.images[currentImage]}
            alt={`${post.title} - 图片 ${currentImage + 1}`}
            className="w-full h-[400px] object-cover"
          />
          {currentImage > 0 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              onClick={() => setCurrentImage(currentImage - 1)}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {currentImage < post.images.length - 1 && (
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
              onClick={() => setCurrentImage(currentImage + 1)}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentImage + 1}/{post.images.length}
          </div>
        </Card>

        <div className="prose dark:prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  )
}
