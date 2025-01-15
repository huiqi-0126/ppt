"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { RefreshCw, Eye, ThumbsUp, Download, Share2, Lightbulb } from "lucide-react"
import { useState, useEffect, ChangeEvent, useCallback, useRef } from "react"

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

export default function Home() {
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const pageSize = 6
  const observer = useRef<IntersectionObserver>()
  const loadingRef = useRef(false)

  const fetchRandomSuggestions = useCallback(async () => {
    try {
      const response = await fetch('/api/suggestions')
      if (!response.ok) throw new Error('获取建议失败')
      const data = await response.json()
      setSuggestions(data.suggestions)
    } catch (error) {
      console.error('获取建议失败:', error)
    }
  }, [])

  useEffect(() => {
    fetchRandomSuggestions()
  }, [fetchRandomSuggestions])

  const handleSearch = useCallback(async () => {
    if (!searchValue.trim()) return
    
    setIsSearching(true)
    setLoading(true)
    setPage(1) // 重置页码
    
    try {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(searchValue)}&page=1&limit=${pageSize}`)
      if (!response.ok) {
        throw new Error('搜索失败')
      }
      const data = await response.json()
      setPosts(data.posts)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('搜索失败:', error)
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }, [searchValue, pageSize])

  const fetchPosts = useCallback(async (page: number) => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    
    try {
      const url = isSearching 
        ? `/api/posts/search?q=${encodeURIComponent(searchValue)}&page=${page}&limit=${pageSize}`
        : `/api/posts?page=${page}&limit=${pageSize}`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('获取数据失败')
      }
      const data = await response.json()
      setPosts(prevPosts => page === 1 ? data.posts : [...prevPosts, ...data.posts])
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('获取数据失败:', error)
      setError(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [isSearching, searchValue, pageSize])

  useEffect(() => {
    fetchPosts(page)
  }, [page, fetchPosts])

  const lastPostRef = useCallback((node: HTMLElement | null) => {
    if (loadingRef.current) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1)
      }
    })
    
    if (node) observer.current.observe(node)
  }, [hasMore])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
  }

  return (
    <main className="container py-12">
      <div>
        <div className="space-y-2 text-center mt-8 mb-12">
          <h1 className="text-xl font-bold tracking-tighter sm:text-2xl md:text-3xl lg:text-4xl">
            快速掌握如何用AI制作你需要的PPT
          </h1>
          <p className="mx-auto max-w-[700px] text-gray-500 text-base !important dark:text-gray-400">
            授人以鱼的同时还授人以渔，PPT文档和AI制作方法都给你
          </p>
        </div>
        
        <div className="mx-auto max-w-2xl pt-5 !mt-0">
          <div className="relative">
            <Input
              placeholder="用关键词描述你需要制作的PPT，用空格分隔"
              value={searchValue}
              onChange={handleInputChange}
              className="h-12 pr-28"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <Button 
              className="absolute right-0 top-0 h-12 w-24 rounded-l-none"
              onClick={handleSearch}
            >
              搜索
            </Button>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-500">试试这样搜索：</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={fetchRandomSuggestions}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  onClick={() => {
                    setSearchValue(suggestion)
                    handleSearch() // 自动触发搜索
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isSearching ? "搜索结果" : "最新作品"}
            </h2>
            <span className="text-sm text-gray-500 ml-4">
              支持原始文档下载
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: Post, index) => (
              <Link 
                key={post.id} 
                href={{
                  pathname: `/posts/${post.id}`,
                  query: { id: post.id }
                }}
                ref={index === posts.length - 1 ? lastPostRef : null}
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
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          {loading && <div className="text-center py-4">加载中...</div>}
          {!hasMore && <div className="text-center py-4 text-gray-500">没有更多内容了</div>}
        </div>
      </div>
    </main>
  )
}
