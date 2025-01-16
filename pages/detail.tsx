import { useState } from 'react'
import LikeDownloadButton from '../components/LikeDownloadButton'
import { PostData } from '../types/postData'

const DetailPage = () => {
  const [postData, setPostData] = useState<PostData | null>(null)

  // 处理点赞数更新
  const handleLikesUpdate = (newLikes: number) => {
    if (postData) {
      setPostData({
        ...postData,
        likes: newLikes
      })
    }
  }

  return (
    <div>
      {/* ... 其他内容 ... */}
      <LikeDownloadButton 
        postId={postData?.id || ''} 
        initialLikes={postData?.likes || 0}
        onLikesUpdate={handleLikesUpdate}  // 添加回调
      />
      {/* ... 其他内容 ... */}
    </div>
  )
}

export default DetailPage
