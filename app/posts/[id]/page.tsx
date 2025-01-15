"use client"

import { useState, useEffect } from "react"
import { decodeId, encodeId } from "@/lib/encodeUtils"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { Badge } from "../../../components/ui/badge"
import { Card } from "../../../components/ui/card"
import { Eye, ThumbsUp, Download, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import LikeDownloadButton from "../../../components/LikeDownloadButton"
import { PaymentModal } from "@/components/PaymentModal"
import { supabase } from '../../../supabaseClient'
import { log } from "console"
import ReactMarkdown from 'react-markdown'

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

export default function PostDetail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const encodedId = searchParams ? searchParams.get('id') : null;
  const id = encodedId ? decodeId(encodedId) : null;
  const [currentImage, setCurrentImage] = useState(0)
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [recommendations, setRecommendations] = useState<Post[]>([])

  const postId = post?.id.toString();
  const isSpecial = searchParams?.get('special') === postId;

  const handleNavigateHome = () => {
    router.push('/')
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', id)
            .single()

          if (error) {
            throw error
          }

          if (!data) {
            throw new Error('Post not found')
          }

          setPost(data)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
          setLoading(false)
        }
      }
      fetchPost()
    }
  }, [id])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data, error } = await supabase
          .from('recommend')
          .select('*')

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        console.log('Fetched data:', data)
        setRecommendations(data)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
      }
    }

    fetchRecommendations()
  }, [id])

  const handleLikesUpdate = (newLikes: number) => {
    if (post) {
      setPost({
        ...post,
        likes: newLikes
      })
    }
  }

  const handleShare = () => {
    if (!post) return;
    const currentUrl = window.location.origin + `/posts/${post.id}?id=${encodeId(post.id)}`
    
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        alert('链接已复制，请粘贴到微信分享')
      })
      .catch(() => {
        prompt('请手动复制以下链接：', currentUrl)
      })
  }

  const handleDownload = async () => {
    const fileUrl = '你的文件下载链接';

    console.log('下载文件URL:', fileUrl);
    if (fileUrl) {
      window.open(fileUrl, "_blank");
      
      try {
        const response = await fetch('/api/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId }),
        });

        if (!response.ok) {
          throw new Error('Failed to update download count');
        }

        const result = await response.json();
        console.log('下载计数更新结果:', result);
      } catch (error) {
        console.error('更新下载计数失败：', error);
      }
    } else {
      console.error('File URL not available');
    }
  };

  useEffect(() => {
    if (post) {
      document.title = post.title+" - 成品PPT，提供中小学课件，山水画PPT，绘本PPT原文件免费下载。";
    }
  }, [post]);

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
              {/* <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {post.views}
              </span> */}
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> {post.likes}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" /> {post.downloads}
              </span>
              {/* <span className="flex items-center gap-1">
                <Share2 className="h-4 w-4" /> {post.shares}
              </span> */}
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

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4">
              {isSpecial ? (
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-[180px] flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-secondary/90"
                  onClick={handleDownload}
                >
                  <span className="text-base font-medium">立即下载</span>
                </Button>
              ) : (
                <LikeDownloadButton
                  postId={postId || ''}
                  initialLikes={post.likes}
                  onLikesUpdate={handleLikesUpdate}
                  className="w-[180px] flex flex-col items-center justify-center gap-0.5 rounded-lg hover:bg-primary/90"
                />
              )}
            </div>
            <div 
              onClick={handleShare}
              className="text-sm text-blue-600 flex items-center gap-1 cursor-pointer hover:text-blue-800 transition-colors"
            >
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
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <PaymentModal 
          open={showPayment}
          onOpenChange={setShowPayment}
          price="1.9元"
        />

        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-4">相关推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommend) => (
              <Card 
                key={recommend.id} 
                className="p-4 cursor-pointer" 
                onClick={() => router.push(`/posts/${recommend.id}?id=${encodeId(recommend.id)}`)}
              >
                <img
                  src={recommend.images[0]}
                  alt={recommend.title}
                  className="w-full h-48 object-cover mb-4"
                />
                <h3 className="text-lg font-semibold">{recommend.title}</h3>
                <p className="text-sm text-gray-500">{recommend.author} · 发布于 {recommend.publishDate}</p>
                <div className="flex gap-2 mt-2">
                  {(Array.isArray(recommend.tags) ? recommend.tags : []).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}
