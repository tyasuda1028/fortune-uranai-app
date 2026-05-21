import type { Metadata } from 'next'

// PayPal決済フロー用ページはインデックス不要
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function PayPalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
