import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://yourdomain.com'),
  title: {
    default: '提供成品PPT下载，涵盖语文、数学、英语课件PPT，小学、初中课件PPT，山水画PPT，绘本PPT等。',
    template: '%s | 高质量PPT资源平台'
  },
  description: '提供成品PPT、语文课件PPT、英语课件PPT、数学课件PPT等高质量模板下载，分享AI生成PPT技巧，教你如何使用AI生成创意PPT。涵盖小学课件PPT、初中课件PPT、山水画PPT、绘本PPT等多种类型，支持原文件下载。',
  keywords: [
    '成品PPT',
    '语文课件PPT',
    '英语课件PPT', 
    '数学课件PPT',
    '小学课件PPT',
    '初中课件PPT',
    '山水画PPT',
    '绘本PPT',
    '原文件下载',
    'AI生成PPT技巧',
    '创意PPT制作',
    '高质量PPT文档'
  ],
  openGraph: {
    title: '提供成品PPT下载，涵盖语文、数学、英语课件PPT，小学、初中课件PPT，山水画PPT，绘本PPT等',
    description: '提供各类高质量PPT模板下载，分享AI生成PPT技巧，教你如何使用AI生成创意PPT。',
    url: 'https://yourdomain.com',
    siteName: 'PPT资源平台',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '提供成品PPT下载，涵盖语文、数学、英语课件PPT，小学、初中课件PPT，山水画PPT，绘本PPT等',
    description: '提供各类高质量PPT模板下载，分享AI生成PPT技巧，教你如何使用AI生成创意PPT。',
    images: ['https://yourdomain.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
