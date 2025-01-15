import path from 'path'
import fs from 'fs'
import { supabase } from '../supabaseClient'

interface Post {
  id: number
  likes: number
}

interface LikeRecord {
  postId: string
  userId: string
  firstLikeCount: number
  lastLikeDate: string
  targetLikes: number
}

export class LikeManager {
  private likesPath: string

  constructor() {
    this.likesPath = path.join(process.cwd(), 'data/likes.json')
    this.initLikesFile()
  }

  async getPostById(postId: string) {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      throw error
    }

    return data
  }

  // 初始化点赞记录文件
  private initLikesFile(): void {
    try {
      if (!fs.existsSync(this.likesPath)) {
        fs.writeFileSync(this.likesPath, JSON.stringify({ records: [] }, null, 2))
      }
    } catch (error) {
      console.error('初始化点赞文件失败:', error)
    }
  }

  // 获取今天的日期字符串
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0]
  }

  // 读取点赞记录
  private getLikesData(): { records: LikeRecord[] } {
    try {
      if (!fs.existsSync(this.likesPath)) {
        return { records: [] }
      }
      const data = fs.readFileSync(this.likesPath, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('读取点赞记录失败:', error)
      return { records: [] }
    }
  }

  // 保存点赞记录
  private saveLikesData(data: { records: LikeRecord[] }): void {
    try {
      fs.writeFileSync(this.likesPath, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('保存点赞记录失败:', error)
    }
  }

  // 修改获取文档数据的方法
  private async getPostData(postId: string): Promise<Post | null> {
    if (!postId) {
      console.error('postId is undefined or null');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) {
        console.error('获取文档数据失败:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('读取文档数据失败:', error)
      return null
    }
  }

  // 修改更新文档点赞数的方法
  private async updatePostLikes(postId: string, likes: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes })
        .eq('id', postId)

      if (error) {
        console.error('更新文档点赞数失败:', error)
      }
    } catch (error) {
      console.error('更新文档点赞数失败:', error)
    }
  }

  // 检查用户今天是否已经点赞
  async canUserLike(postId: string, userId: string): Promise<boolean> {
    try {
      const likesData = this.getLikesData()
      const record = likesData.records.find(
        r => r.postId === postId && r.userId === userId
      )
      
      console.log("检查用户今天是否已经点赞========",postId)
      if (!record) return true
      return record.lastLikeDate !== this.getTodayString()
    } catch (error) {
      console.error('检查点赞状态失败:', error)
      return false
    }
  }

  // 修改处理点赞的方法
  async handleLike(postId: string, userId: string): Promise<{
    success: boolean
    currentLikes: number
    remainingLikes: number
  }> {
    try {
      const likesData = this.getLikesData()
      const post = await this.getPostData(postId)

      if (!post) {
        console.error('未找到文档:', postId)
        return { success: false, currentLikes: 0, remainingLikes: 10 }
      }

      let record = likesData.records.find(
        r => r.postId === postId && r.userId === userId
      )

      if (!record) {
        // 首次点赞
        record = {
          postId,
          userId,
          firstLikeCount: post.likes,
          lastLikeDate: this.getTodayString(),
          targetLikes: 10
        }
        likesData.records.push(record)
      } else if (record.lastLikeDate === this.getTodayString()) {
        // 今天已经点赞
        return {
          success: false,
          currentLikes: post.likes,
          remainingLikes: Math.max(0, record.targetLikes - (post.likes - record.firstLikeCount))
        }
      } else {
        // 更新点赞日期
        record.lastLikeDate = this.getTodayString()
      }

      // 更新点赞数
      const newLikes = post.likes + 1
      this.updatePostLikes(postId, newLikes)
      this.saveLikesData(likesData)

      const remainingLikes = Math.max(0, record.targetLikes - (newLikes - record.firstLikeCount))

      return {
        success: true,
        currentLikes: newLikes,
        remainingLikes
      }
    } catch (error) {
      console.error('处理点赞失败:', error)
      return { success: false, currentLikes: 0, remainingLikes: 10 }
    }
  }

  // 获取点赞状态
  async getLikeStatus(postId: string, userId: string): Promise<{
    canLike: boolean
    remainingLikes: number
  }> {
    try {
      const likesData = this.getLikesData()
      const post = await this.getPostData(postId)
      // console.log("获取点赞状态========",post)
      if (!post) {
        return { canLike: false, remainingLikes: 10 }
      }

      const record = likesData.records.find(
        r => r.postId === postId && r.userId === userId
      )

      if (!record) {
        return { canLike: true, remainingLikes: 10 }
      }

      const canLike = record.lastLikeDate !== this.getTodayString()
      const remainingLikes = Math.max(0, record.targetLikes - (post.likes - record.firstLikeCount))

      return { canLike, remainingLikes }
    } catch (error) {
      console.error('获取点赞状态失败:', error)
      return { canLike: false, remainingLikes: 10 }
    }
  }
}
