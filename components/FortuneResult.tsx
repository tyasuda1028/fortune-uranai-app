'use client'

import { useState } from 'react'
import type { FortuneResult, FortuneCategoryResult, Rating, FortunePeriod } from '@/lib/types'
import { formatDateJP, getWeekRange, getMonthRange } from '@/lib/calculations'

interface FortuneResultProps {
  result: FortuneResult
  name: string
  fortuneDate: string
  fortunePeriod?: FortunePeriod
  onReset: () => void
}

const SCORE_LABEL = (score: number): string => {
  if (score >= 80) return '非常に良い'
  if (score >= 60) return '良い'
  if (score >= 40) return 'やや注意'
  return '要注意'
}

const SCORE_COLOR = (score: number): string => {
  if (score >= 80) return 'text-amber-400'
  if (score >= 60) return 'text-emerald-400'
  if (score >= 40) return 'text-sky-400'
  return 'text-rose-400'
}

const SCORE_BAR_COLOR = (score: number): string => {
  if (score >= 80) return 'bg-amber-400'
  if (score >= 60) return 'bg-emerald-400'
  if (score >= 40) return 'bg-sky-400'
  return 'bg-rose-400'
}

const RATING_BG: Record<Rating, string> = {
  '◎': 'from-amber-900/30 to-amber-800/10 border-amber-700/30',
  '◯': 'from-emerald-900/30 to-emerald-800/10 border-emerald-700/30',
  '△': 'from-sky-900/30 to-sky-800/10 border-sky-700/30',
  '×': 'from-rose-900/30 to-rose-800/10 border-rose-700/30',
}

interface FortuneCategoryCardProps {
  icon: string
  title: string
  data: FortuneCategoryResult
  delay?: number
}

function FortuneCategoryCard({ icon, title, data, delay = 0 }: FortuneCategoryCardProps) {
  return (
    <div
      className={`glass-card p-4 border bg-gradient-to-br ${RATING_BG[data.rating]} animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-slate-300">{title}</span>
        <div className={`rating-badge rating-${data.rating} ml-auto`}>{data.rating}</div>
      </div>
      {/* Flow / Caution / Action */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <span className="text-xs text-blue-400 font-semibold w-8 flex-shrink-0 pt-0.5">流れ</span>
          <p className="text-xs text-slate-300 leading-relaxed">{data.flow}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-amber-400 font-semibold w-8 flex-shrink-0 pt-0.5">注意</span>
          <p className="text-xs text-slate-300 leading-relaxed">{data.caution}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-emerald-400 font-semibold w-8 flex-shrink-0 pt-0.5">対策</span>
          <p className="text-xs text-slate-300 leading-relaxed">{data.action}</p>
        </div>
      </div>
    </div>
  )
}

interface FortuneDetailRowProps {
  icon: string
  label: string
  text: string
}

function FortuneDetailRow({ icon, label, text }: FortuneDetailRowProps) {
  return (
    <div className="flex gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-base w-5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-purple-300 font-medium mb-0.5">{label}</p>
        <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
      </div>
    </div>
  )
}

export default function FortuneResult({ result, name, fortuneDate, fortunePeriod = 'day', onReset }: FortuneResultProps) {
  const [showDetails, setShowDetails] = useState(false)

  const periodBadge = fortunePeriod === 'week' ? '週運' : fortunePeriod === 'month' ? '月運' : '日運'
  const periodIcon  = fortunePeriod === 'week' ? '📅' : fortunePeriod === 'month' ? '🌙' : '☀️'
  const dateLabel =
    fortunePeriod === 'week'
      ? `${getWeekRange(fortuneDate).label}（7日間）`
      : fortunePeriod === 'month'
      ? `${getMonthRange(fortuneDate).label}（1ヶ月）`
      : formatDateJP(fortuneDate)

  const periodWord = fortunePeriod === 'week' ? '今週' : fortunePeriod === 'month' ? '今月' : '今日'

  const categories: FortuneCategoryCardProps[] = [
    { icon: '💼', title: '仕事運', data: result.work_fortune, delay: 100 },
    { icon: '💰', title: '金運',   data: result.money_fortune,  delay: 200 },
    { icon: '❤️', title: '恋愛・対人運', data: result.love_fortune, delay: 300 },
    { icon: '🌿', title: '健康運', data: result.health_fortune, delay: 400 },
  ]

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Header */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-1.5 bg-purple-900/40 border border-purple-700/40 rounded-full px-3 py-1 text-xs text-purple-300 font-semibold mb-2">
          <span>{periodIcon}</span>
          <span>{periodBadge}</span>
        </div>
        <p className="text-xs text-slate-500 mb-1">{dateLabel}</p>
        <h2 className="text-xl font-bold text-white">{name}さんの運勢鑑定</h2>
      </div>

      {/* Overall Rating */}
      <div
        className={`glass-card p-6 border bg-gradient-to-br ${RATING_BG[result.overall_rating]} animate-slide-up`}
      >
        {/* Score display */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">総合評価</p>
          <span className="text-xs text-slate-500">{SCORE_LABEL(result.overall_score ?? 0)}</span>
        </div>
        <div className="mb-4">
          <div className="flex items-end gap-1 mb-2">
            <span className={`text-5xl font-bold tabular-nums ${SCORE_COLOR(result.overall_score ?? 0)}`}>
              {result.overall_score ?? '–'}
            </span>
            <span className="text-slate-500 text-lg mb-1">/ 100</span>
          </div>
          {/* Score bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${SCORE_BAR_COLOR(result.overall_score ?? 0)}`}
              style={{ width: `${result.overall_score ?? 0}%` }}
            />
          </div>
        </div>

        {/* Flow / Caution / Action */}
        <div className="space-y-3 pt-1 border-t border-white/10">
          <div className="flex gap-3 pt-3">
            <span className="text-xs text-blue-400 font-semibold w-10 flex-shrink-0 pt-0.5">📈 流れ</span>
            <p className="text-sm text-slate-300 leading-relaxed">{result.overall_flow}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-xs text-amber-400 font-semibold w-10 flex-shrink-0 pt-0.5">⚠️ 注意</span>
            <p className="text-sm text-slate-300 leading-relaxed">{result.overall_caution}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-xs text-emerald-400 font-semibold w-10 flex-shrink-0 pt-0.5">✅ 対策</span>
            <p className="text-sm text-slate-300 leading-relaxed">{result.overall_action}</p>
          </div>
        </div>
      </div>

      {/* Fortune Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <FortuneCategoryCard key={cat.title} {...cat} />
        ))}
      </div>

      {/* Lucky Color */}
      <div
        className="glass-card p-5 flex items-center gap-4 animate-slide-up"
        style={{ animationDelay: '500ms', animationFillMode: 'both' }}
      >
        <div
          className="color-swatch"
          style={{
            backgroundColor: result.lucky_color_hex,
            '--swatch-color': result.lucky_color_hex,
          } as React.CSSProperties}
        />
        <div>
          <p className="text-xs text-purple-300 font-medium mb-0.5">🎨 ラッキーカラー</p>
          <p className="text-lg font-bold text-white">{result.lucky_color}</p>
        </div>
      </div>

      {/* Advice */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '550ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">💌 占い師からのメッセージ</p>
        <p className="text-sm text-slate-300 leading-relaxed">{result.advice}</p>
      </div>

      {/* Today's Word */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '600ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">
          🔑 {periodWord}のひと言
        </p>
        <div className="quote-block">{result.todays_word}</div>
      </div>

      {/* Fortune Details (collapsible) */}
      <div
        className="glass-card overflow-hidden animate-slide-up"
        style={{ animationDelay: '650ms', animationFillMode: 'both' }}
      >
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="w-full p-5 flex items-center justify-between text-left"
        >
          <span className="text-sm font-semibold text-purple-300">✦ 占術別詳細</span>
          <span
            className="text-slate-500 text-lg transition-transform duration-200"
            style={{ transform: showDetails ? 'rotate(180deg)' : 'none' }}
          >
            ▾
          </span>
        </button>

        {showDetails && (
          <div className="px-5 pb-4">
            <div className="mystic-divider" style={{ marginTop: 0 }} />
            <FortuneDetailRow icon="⭐" label="六星占術" text={result.fortune_details.rokusei} />
            <FortuneDetailRow icon="♈" label="西洋占星術" text={result.fortune_details.zodiac} />
            <FortuneDetailRow icon="🔢" label="数秘術" text={result.fortune_details.numerology} />
            <FortuneDetailRow icon="📈" label="バイオリズム" text={result.fortune_details.biorhythm} />
            <FortuneDetailRow icon="🀄" label="四柱推命" text={result.fortune_details.shichusuimei} />
            <FortuneDetailRow icon="🩸" label="血液型占い" text={result.fortune_details.blood_type} />
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="text-center pt-2 pb-8">
        <button onClick={onReset} className="btn-primary">
          <span className="flex items-center gap-2">
            <span>🔮</span>
            <span>もう一度占う</span>
          </span>
        </button>
      </div>
    </div>
  )
}
