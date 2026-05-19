import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { jaJP } from '@clerk/localizations'
import { LangProvider } from '@/lib/i18n-context'
import './globals.css'

const APP_URL = 'https://sophie1028.com'
const APP_NAME = '運勢占い｜複合占術鑑定'
const APP_DESCRIPTION =
  '六星占術・西洋占星術・数秘術・バイオリズム・四柱推命・タロット占いを組み合わせた総合運勢鑑定。日運・週運・月運に対応。無料で5回まで利用できます。'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: '%s | 運勢占い',
  },
  description: APP_DESCRIPTION,
  keywords: [
    '占い', '運勢', '六星占術', '西洋占星術', '数秘術', 'バイオリズム',
    '四柱推命', 'タロット占い', '血液型占い', '日運', '週運', '月運',
    '総合占い', '無料占い', '今日の運勢',
  ],
  authors: [{ name: '運勢占いアプリ' }],
  creator: '運勢占いアプリ',
  verification: {
    google: '4GEvA9ou-balM6OP1Ef21OB7y_-Z0VgmKkBZl4NvSdg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: APP_URL + '/og-image.png',
        width: 1200,
        height: 630,
        alt: '運勢占い｜複合占術鑑定',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [APP_URL + '/og-image.png'],
  },
  alternates: {
    canonical: APP_URL,
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
        <body>
          <LangProvider>{children}</LangProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
