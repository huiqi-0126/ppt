"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { decodeId, encodeId } from "@/lib/encodeUtils"
import { Badge } from "@/components/ui/badge"
import { Eye, ThumbsUp, Download, Share2 } from "lucide-react"

interface Post {
  id: number
  title: string
  images: string[]
  views: number
  likes: number
  downloads: number
  shares: number
  tags: string[]
  author: string
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Link 
      href={{
        pathname: `/posts/${post.id}`,
        query: { id: encodeId(post.id) }
      }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <img
          src={post.images[0]}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <div className="flex gap-4 text-gray-500 mb-3">
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
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(post.tags) ? post.tags : []).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    </Link>
  )
} 