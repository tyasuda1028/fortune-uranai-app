'use client'

import { useRouter } from 'next/navigation'

export default function PayPalCancelPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#0f0a1e] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-5xl mb-5">😔</div>
        <p className="text-white text-lg font-semibold mb-2">お申し込みをキャンセルしました</p>
        <p className="text-slate-400 text-sm mb-6">いつでもプレミアムにアップグレードできます</p>
        <button
          onClick={() => router.push('/')}
          className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          トップに戻る
        </button>
      </div>
    </main>
  )
}
