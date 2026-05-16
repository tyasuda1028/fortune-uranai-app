import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import './globals.css'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '無料占い｜六星占術×数秘術×西洋占星術の複合鑑定',
  description: '生年月日を入力するだけで六星占術・数秘術・西洋占星術・バイオリズム・宿曜占星術を組み合わせた本格鑑定が無料で受けられます。毎日の運勢も確認できます。',
  keywords: ['六星占術', '数秘術', '無料占い', '運勢', '西洋占星術', '宿曜占星術', 'バイオリズム', '複合占い'],
  openGraph: {
    title: '無料占い｜六星占術×数秘術×西洋占星術の複合鑑定',
    description: '生年月日を入力するだけで本格的な複合占術鑑定が無料で受けられます',
    url: 'https://fortune-uranai-app.vercel.app',
    siteName: '運勢占い',
    locale: 'ja_JP',
    type: 'website',
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={jaJP}>
      <html lang="ja">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
