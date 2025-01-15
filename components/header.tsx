"use client"

import Link from 'next/link'
import { PresentationIcon } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { Button } from './ui/button'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80">
          <PresentationIcon className="h-6 w-6 text-blue-500" />
          <span className="font-bold">成品PPT</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          <Button variant="outline">登录</Button>
        </div>
      </div>
    </header>
  )
}
