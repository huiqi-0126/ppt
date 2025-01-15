import { useState, useEffect } from 'react'
import { getUserId } from '../utils/deviceFingerprint'
import { Button } from './ui/button'
import { supabase } from '../supabaseClient'


interface Props {
  postId: string
  initialLikes: number
  onLikesUpdate?: (newLikes: number) => void
  className?: string
}

interface Post {
  id: number
  title: string
  author: string
  views: number
  likes: number
  downloads: number
  fileUrl: string
  shares: number
  tags: string[]
  images: string[]
  content: string
  publishDate: string
}
const LikeDownloadButton = ({ postId, initialLikes, onLikesUpdate, className }: Props) => {
  const [likes, setLikes] = useState(initialLikes)
  const [remainingLikes, setRemainingLikes] = useState(10)
  const [userId, setUserId] = useState('')
  const [canLike, setCanLike] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fileUrl, setFileUrl] = useState('')
  const [posts, setPosts] = useState<Post[]>([])

  const findAndSetPost = (posts: Post[]) => {
    const post = posts.find(post => post.id === Number(postId))
    console.log('找到的帖子:', post)
    if (post) {
      setFileUrl(post.fileUrl || '')
    } else {
      console.error('Post not found')
    }
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) {
        throw error
      }

      setPosts(data ? [data] : [])
      } catch (error) {
        console.error('获取帖子失败:', error)
      }
    }

    fetchPosts()
  }, [postId])

  useEffect(() => {
    if (posts.length > 0) {
      findAndSetPost(posts)
    }
  }, [posts, postId])

  useEffect(() => {
    const init = async () => {
      try {
        const id = await getUserId()
        console.log('获取到用户ID:', id)
        setUserId(id)
        
        const response = await fetch('/api/like/check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId, userId: id }),
        })
        const data = await response.json()
        console.log('检查点赞状态:', data)
        setCanLike(data.canLike)
        if (typeof data.remainingLikes === 'number') {
          setRemainingLikes(data.remainingLikes)
        }

        // Debugging postId
        console.log('传递的 postId:', postId)

      } catch (error) {
        console.error('初始化失败：', error)
      }
    }
    init()
  }, [postId])

  const handleLikeClick = async () => {
    console.log('点击点赞按钮')
    if (!userId) {
      console.error('用户ID获取失败')
      return
    }

    if (!canLike) {
      console.log('今天已经点过赞了')
      return
    }

    setLoading(true)
    try {
      console.log('发送点赞请求:', { postId, userId })
      const response = await fetch('/api/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          userId,
        }),
      })

      const result = await response.json()
      console.log('点赞结果:', result)

      if (response.ok && result.success) {
        setLikes(result.currentLikes)
        setRemainingLikes(result.remainingLikes)
        setCanLike(false)
        
        if (onLikesUpdate) {
          onLikesUpdate(result.currentLikes)
        }
        console.log('点赞成功')
      } else {
        if (result.remainingLikes <= 0) {
          console.log('已达到下载条件')
        } else {
          console.error('点赞失败:', result.message)
        }
      }
    } catch (error) {
      console.error('点赞失败：', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    console.log('下载文件URL:', fileUrl)
    if (fileUrl) {
      window.open(fileUrl, "_blank")
      
      try {
        // 查询当前下载数量
        const { data: postData, error: fetchError } = await supabase
          .from('posts')
          .select('downloads')
          .eq('id', postId)
          .single();

        if (fetchError) {
          throw new Error('Failed to fetch current download count');
        }

        const currentDownloads = postData.downloads || 0; // 获取当前下载数量，默认为0

        // 更新下载计数
        const { error: updateError } = await supabase
          .from('posts')
          .update({ downloads: currentDownloads + 1 }) // 下载数量加一
          .eq('id', postId);

        if (updateError) {
          throw new Error('Failed to update downloads in Post table');
        }

        console.log('下载计数更新成功');

      } catch (error) {
        console.error('更新下载计数失败：', error);
      }
    } else {
      console.error('File URL not available')
    }
  }

  return (
    <Button 
      onClick={remainingLikes > 0 ? handleLikeClick : handleDownload}
      disabled={loading || (!canLike && remainingLikes > 0)}
      className={className}
      size="xl"
    >
      <div className="flex flex-col items-center justify-center">
        <span className="text-base font-medium">
          {loading ? '处理中...' : remainingLikes > 0 ? '点赞下载' : '立即下载'}
        </span>
        {remainingLikes > 0 && (
          <span className="text-[11px] font-normal">
            还差{remainingLikes}赞
          </span>
        )}
      </div>
    </Button>
  )
}

export default LikeDownloadButton
