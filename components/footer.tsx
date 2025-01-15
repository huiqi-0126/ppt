"use client"

import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-gray-700 transition-colors">
              用户协议
            </Link>
            <Link href="/privacy" className="hover:text-gray-700 transition-colors">
              隐私政策
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()} 成品PPT. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
} 