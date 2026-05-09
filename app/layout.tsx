import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '✨ 運勢占い | 複合占術鑑定',
  description: '六星占術・西洋占星術・数秘術・バイオリズム・宿曜占星術を組み合わせた総合運勢鑑定アプリ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
