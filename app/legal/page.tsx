'use client'

import Link from 'next/link'
import { useLang } from '@/lib/i18n-context'

const ITEMS = [
  { label: '販売事業者名', value: '総合占い　安田哲也' },
  { label: '所在地', value: '愛知県東海市（詳細住所はお問い合わせ後に開示いたします）' },
  { label: '電話番号', value: '070-8317-5210（受付：平日10:00〜18:00）' },
  { label: 'メールアドレス', value: 'tyasuda83101028@gmail.com' },
  { label: 'サービス名', value: '運勢占いプレミアムプラン' },
  { label: '販売価格', value: '月額500円（税込）' },
  { label: '支払方法', value: 'クレジットカード（Visa・Mastercard・JCB・American Express）' },
  { label: '支払時期', value: 'お申し込み時に即時決済。以降は毎月同日に自動更新。' },
  { label: 'サービス提供時期', value: 'お申し込み完了後、即時ご利用いただけます。' },
  { label: '継続課金について', value: '月額プランは毎月自動更新されます。解約しない限り継続して課金されます。' },
  { label: 'キャンセル・解約', value: 'サービス内のカスタマーポータルからいつでも解約可能です。解約後は次回更新日まで引き続きご利用いただけます。月途中の解約による日割り返金はありません。' },
  { label: '返金ポリシー', value: '既に決済済みの料金の返金は原則として行っておりません。ただし、システム障害等により本サービスが利用できない場合はこの限りではありません。' },
  { label: '動作環境', value: 'インターネット接続環境が必要です。最新版のChrome・Safari・Firefox・Edgeで動作確認済みです。' },
]

export default function LegalPage() {
  const { lang } = useLang()
  const backLabel = lang === 'en' ? '← Back to Top' : lang === 'zh-TW' ? '← 返回首頁' : lang === 'zh-CN' ? '← 返回首页' : '← トップに戻る'

  return (
    <main className="min-h-screen bg-[#0f0a1e] text-slate-300">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm mb-8 transition-colors">
          {backLabel}
        </Link>

        <h1 className="text-2xl font-bold text-white mb-2">特定商取引法に基づく表記</h1>
        <p className="text-xs text-slate-500 mb-10">最終更新日：2026年5月17日</p>

        <div className="divide-y divide-white/5">
          {ITEMS.map(({ label, value }) => (
            <div key={label} className="py-4 sm:flex sm:gap-4">
              <dt className="text-xs font-semibold text-purple-300 w-40 flex-shrink-0 mb-1 sm:mb-0 sm:pt-0.5">
                {label}
              </dt>
              <dd className="text-sm text-slate-300 leading-relaxed">{value}</dd>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 bg-white/5 rounded-xl text-xs text-slate-500">
          <p>ご不明な点がございましたら、<a href="mailto:tyasuda83101028@gmail.com" className="text-purple-400 underline">tyasuda83101028@gmail.com</a> までお問い合わせください。</p>
        </div>
      </div>
    </main>
  )
}
