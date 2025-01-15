"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card as UiCard } from "@/components/ui/card"
import { RefreshCw, Eye, ThumbsUp, Download, Lightbulb } from "lucide-react"
import { useState, useEffect, ChangeEvent, useCallback, useRef } from "react"
import { PostCard } from "@/components/post-card"
import Image from 'next/image'
import { supabase } from '../supabaseClient'
import { encodeId } from "@/lib/encodeUtils"

interface Post {
  id: number
  title: string
  images: string[]
  views: number
  likes: number
  downloads: number
  publishDate:string
  shares: number
  tags: string[]
  author: string
}

// 更新 AI 工具数据，使用本地图片路径
const aiTools = [
  {
    name: "豆包",
    description: "抖音旗下AI工具，你的智能助手",
    url: "https://kimi.moonshot.cn/",
    icon: "/images/doubao_icon.png"
  },
  {
    name: "即梦生图",
    description: "免费AI绘画和视频生成工具",
    url: "https://jimmg.com/",
    icon: "/images/jimeng_icon.png"
  },
  {
    name: "KimiPPT",
    description: "长文本?不在话下!Kimi智能梳理，效率卓越。",
    url: "https://kimi.moonshot.cn/",
    icon: "/images/kimi_icon.png"
  },
  {
    name: "美图AI PPT",
    description: "专注于美化和设计的AI PPT工具，让PPT更具视觉冲击力",
    url: "https://www.designkit.com/ppt/",
    icon: "/images/meitu-ai-ppt.jpg"
  },
  {
    name: "ChatPPT",
    description: "创新的AI驱动PPT生成工具，通过对话式交互和全流程AI创作",
    url: "https://chat-ppt.com/",
    icon: "/images/chatppt-icon.png"
  },
  {
    name: "爱设计PPT",
    description: "AI驱动的PPT制作神器，让设计更简单",
    url: "https://ppt.isheji.com/",
    icon: "/images/isheji-ppt-icon.png"
  },
  {
    name: "免费ChatGPT中文版",
    description: "智能PPT生成助手，让PPT制作更加轻松快捷",
    url: "https://chatgai.lovepor.cn/",
    icon: "/images/gezhe-caixuan-icon.png"
  },
  {
    name: "auxi",
    description: "专业的AI驱动PPT生成工具，支持多种场景和行业模板",
    url: "https://www.auxi.ai/",
    icon: "/images/auxi-icon.png"
  }
]

interface CustomCardProps {
  title: string;
  cover: string;
  downloads: number;
  className?: string;
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
  const [totalResults, setTotalResults] = useState(0)
  const [recommendPosts, setRecommendPosts] = useState<Post[]>([])

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

  const fetchPostsFromSupabase = useCallback(async () => {


    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      setPosts(data || []);
      setError(null);


    } catch (error) {
      console.error('Error fetching data from Supabase:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async (queryOrEvent?: string | React.MouseEvent<HTMLButtonElement>) => {
    let query = typeof queryOrEvent === 'string' ? queryOrEvent : searchValue.trim();
    if (typeof queryOrEvent !== 'string') {
      queryOrEvent?.preventDefault();
    }
    
    if (query === '') {
      setIsSearching(false);
      setLoading(true);
      setPosts([]);
      setPage(1);
      setError(null);
      setHasMore(true);
      setTotalResults(0);
      fetchPostsFromSupabase();
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    setPosts([]);
    setPage(1);
    setError(null);
    setHasMore(false);
    setTotalResults(0);
    
    try {
      const response = await fetch(`/api/posts/search?q=${encodeURIComponent(query)}&page=1&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error('搜索失败');
      }
      const data = await response.json();
      
      if (data.posts.length === 0) {
        setError('没有搜索到相关PPT');
        setPosts([]);
        setTotalResults(0);
        const recommendResponse = await fetch('/api/recommend');
        const recommendData = await recommendResponse.json();
        setRecommendPosts(recommendData.posts);
      } else {
        setPosts(data.posts);
        setTotalResults(data.posts.length);
        setHasMore(false);
        setRecommendPosts([]);
      }
    } catch (error) {
      console.error('搜索失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
      setPosts([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [searchValue, pageSize, fetchPostsFromSupabase]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (typeof suggestion !== 'string') return;
    setSearchValue(suggestion);
    handleSearch(suggestion);
  }, [handleSearch]);

  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loading) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !isSearching) {
        setPage(prevPage => prevPage + 1)
        fetchPostsFromSupabase()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, hasMore, isSearching, page, fetchPostsFromSupabase])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }

  useEffect(() => {
    if (!isSearching) {
      fetchPostsFromSupabase();
    }
  }, [isSearching, fetchPostsFromSupabase]);

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
            <div className="mt-2 flex flex-nowrap gap-2 overflow-hidden whitespace-nowrap" style={{ width: 'calc(100% + 200px)' }}>
              {suggestions.slice(0, 4).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  className="flex-shrink-0"
                  onClick={() => handleSuggestionClick(suggestion)}
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
              {isSearching ? "搜索结果" : "精选作品"}
            </h2>
            {isSearching && totalResults > 0 && (
              <span className="text-sm text-gray-500 ml-4">
                找到 {totalResults} 条相关内容
              </span>
            )}
          </div>
          
          {error ? (
            <>
              <div className="text-center py-8 text-gray-500">
                {error}
              </div>
              {recommendPosts.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold mb-4">相关推荐</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recommendPosts.map((post) => (
                      <Link 
                        key={post.id} 
                        href={{
                          pathname: `/posts/${post.id}`,
                          query: { id: encodeId(post.id) }
                        }}
                      >
                        <UiCard className="p-4 cursor-pointer">
                          <img
                            src={post.images[0]}
                            alt={post.title}
                            className="w-full h-48 object-cover mb-4"
                          />
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <p className="text-sm text-gray-500">{post.author} · 发布于 {post.publishDate}</p>
                          <div className="flex gap-2 mt-2">
                            {(Array.isArray(post.tags) ? post.tags : []).map((tag) => (
                              <Badge key={tag} variant="secondary">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </UiCard>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <div
                  key={post.id}
                  ref={index === posts.length - 1 ? lastPostRef : undefined}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
          
          {loading && <div className="text-center py-4">加载中...</div>}
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-4 text-gray-500"></div>
          )}
        </div>
      </div>

      {/* AI工具模块 */}
      <section className="container mx-auto px-4 py-12 border-t">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">AI 工具推荐</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiTools.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 bg-white rounded-lg border hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <Image 
                      src={tool.icon}
                      alt={`${tool.name} 图标`}
                      fill
                      className="object-contain"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
