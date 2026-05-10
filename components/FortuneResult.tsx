'use client'

import { useState } from 'react'
import type { FortuneResult, Rating, FortunePeriod } from '@/lib/types'
import { formatDateJP, formatMonthJP, getWeekRange } from '@/lib/calculations'

interface FortuneResultProps {
  result: FortuneResult
  name: string
  fortuneDate: string
  fortunePeriod?: FortunePeriod
  onReset: () => void
}

const RATING_LABEL: Record<Rating, string> = {
  '◎': '大吉',
  '◯': '吉',
  '△': '小吉',
  '×': '注意',
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
  rating: Rating
  description: string
  delay?: number
}

function FortuneCategoryCard({ icon, title, rating, description, delay = 0 }: FortuneCategoryCardProps) {
  return (
    <div
      className={`glass-card p-4 border bg-gradient-to-br ${RATING_BG[rating]} animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-slate-300">{title}</span>
        <div className={`rating-badge rating-${rating} ml-auto`}>{rating}</div>
      </div>
      <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
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

  // Build period label and badge
  const periodBadge = fortunePeriod === 'week' ? '週運' : fortunePeriod === 'month' ? '月運' : '日運'
  const periodIcon  = fortunePeriod === 'week' ? '📅' : fortunePeriod === 'month' ? '🌙' : '☀️'
  const dateLabel =
    fortunePeriod === 'month'
      ? formatMonthJP(fortuneDate)
      : fortunePeriod === 'week'
      ? getWeekRange(fortuneDate).label
      : formatDateJP(fortuneDate)

  const categories: FortuneCategoryCardProps[] = [
    { icon: '💼', title: '仕事運', rating: result.work_fortune.rating, description: result.work_fortune.description, delay: 100 },
    { icon: '💰', title: '金運', rating: result.money_fortune.rating, description: result.money_fortune.description, delay: 200 },
    { icon: '❤️', title: '恋愛・対人運', rating: result.love_fortune.rating, description: result.love_fortune.description, delay: 300 },
    { icon: '🌿', title: '健康運', rating: result.health_fortune.rating, description: result.health_fortune.description, delay: 400 },
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
        <h2 className="text-xl font-bold text-white">
          {name}さんの運勢
        </h2>
      </div>

      {/* Overall Rating */}
      <div
        className={`glass-card p-8 text-center border bg-gradient-to-br ${RATING_BG[result.overall_rating]} animate-slide-up`}
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">総合運</p>
        <div className={`rating-large rating-large-${result.overall_rating} mb-2`}>
          {result.overall_rating}
        </div>
        <p className={`text-lg font-bold mb-4 rating-large-${result.overall_rating}`}>
          {RATING_LABEL[result.overall_rating]}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
          {result.overall_description}
        </p>
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
        <p className="text-xs text-purple-300 font-medium mb-3">
          💡 {fortunePeriod === 'week' ? '今週の' : fortunePeriod === 'month' ? '今月の' : '今日の'}アドバイス
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">{result.advice}</p>
      </div>

      {/* Today's Word */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '600ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">
          🔑 {fortunePeriod === 'week' ? '今週の' : fortunePeriod === 'month' ? '今月の' : '今日の'}ひと言
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
            <FortuneDetailRow icon="🧬" label="血液型・性格傾向" text={result.fortune_details.blood_personality} />
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
