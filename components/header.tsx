"use client"

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PresentationIcon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { getUserId } from '../utils/deviceFingerprint'

export default function Header() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const initUserId = async () => {
      const id = await getUserId()
      setUserId(id.slice(-6))
    }
    initUserId()
  }, [])

  const handleNavigateHome = () => {
    router.push('/')
    // setTimeout(() => {
    //   window.location.reload()
    // }, 100)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
    if (!searchInput?.value.trim()) {
      window.location.reload()
      return
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80" onClick={handleNavigateHome}>
          <PresentationIcon className="h-6 w-6 text-blue-500" />
          <span className="font-bold">成品PPT</span>
          <span className="text-sm text-gray-500">提供中小学课件，山水画PPT，绘本PPT原文件免费下载</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>👤</span>
            <span>{userId}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
