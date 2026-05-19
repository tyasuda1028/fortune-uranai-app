'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ReturnContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const subscriptionId = searchParams.get('subscription_id')
    if (!subscriptionId) {
      setStatus('error')
      setMessage('サブスクリプションIDが見つかりません。')
      return
    }

    fetch('/api/paypal/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus('success')
          setTimeout(() => router.push('/?success=true'), 2500)
        } else {
          setStatus('error')
          setMessage(data.error ?? '有効化に失敗しました。')
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('ネットワークエラーが発生しました。')
      })
  }, [searchParams, router])

  return (
    <main className="min-h-screen bg-[#0f0a1e] flex items-center justify-center px-6">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl mb-5" style={{ animation: 'spin 1.5s linear infinite' }}>✨</div>
            <p className="text-white text-lg font-semibold mb-2">プレミアム登録を処理中...</p>
            <p className="text-slate-400 text-sm">しばらくお待ちください</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-5">🎉</div>
            <p className="text-white text-xl font-bold mb-2">プレミアム登録完了！</p>
            <p className="text-purple-300 text-sm mb-1">タロット占い・詳細鑑定など</p>
            <p className="text-purple-300 text-sm mb-4">すべての機能が使えるようになりました</p>
            <p className="text-slate-500 text-xs">トップページに移動します...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-5">⚠️</div>
            <p className="text-white text-lg font-semibold mb-2">エラーが発生しました</p>
            <p className="text-rose-300 text-sm mb-5">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              トップに戻る
            </button>
          </>
        )}
      </div>
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </main>
  )
}

export default function PayPalReturnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
          <div className="text-5xl">✨</div>
        </main>
      }
    >
      <ReturnContent />
    </Suspense>
  )
}
