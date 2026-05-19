'use client'

import { useEffect } from 'react'
import type { CompatibilityResult, CompatibilityCategoryResult, Rating } from '@/lib/types'
import { useLang } from '@/lib/i18n-context'

interface CompatibilityResultProps {
  result: CompatibilityResult
  nameA: string
  nameB: string
  onReset: () => void
}

const RATING_BG: Record<Rating, string> = {
  '◎': 'from-amber-900/30 to-amber-800/10 border-amber-700/30',
  '◯': 'from-emerald-900/30 to-emerald-800/10 border-emerald-700/30',
  '△': 'from-sky-900/30 to-sky-800/10 border-sky-700/30',
  '×': 'from-rose-900/30 to-rose-800/10 border-rose-700/30',
}

function scoreColor(score: number): string {
  if (score >= 80) return 'text-amber-400'
  if (score >= 60) return 'text-emerald-400'
  if (score >= 40) return 'text-sky-400'
  return 'text-rose-400'
}

function scoreBarColor(score: number): string {
  if (score >= 80) return 'from-amber-600 to-yellow-400'
  if (score >= 60) return 'from-emerald-600 to-teal-400'
  if (score >= 40) return 'from-sky-600 to-blue-400'
  return 'from-rose-600 to-pink-400'
}

interface CategoryCardProps {
  icon: string
  title: string
  data: CompatibilityCategoryResult
  delay?: number
}

function CategoryCard({ icon, title, data, delay = 0 }: CategoryCardProps) {
  return (
    <div
      className={`glass-card p-4 border bg-gradient-to-br ${RATING_BG[data.rating]} animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-semibold text-slate-300">{title}</span>
        <div className={`rating-badge rating-${data.rating} ml-auto`}>{data.rating}</div>
      </div>

      {/* Score bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-500">相性スコア</span>
          <span className={`text-sm font-bold ${scoreColor(data.score)}`}>{data.score}点</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(data.score)} transition-all duration-700`}
            style={{ width: `${data.score}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-2">{data.comment}</p>
      <div className="flex gap-2">
        <span className="text-xs text-purple-400 font-semibold w-12 flex-shrink-0 pt-0.5">アドバイス</span>
        <p className="text-xs text-slate-400 leading-relaxed">{data.advice}</p>
      </div>
    </div>
  )
}

interface DetailRowProps {
  icon: string
  label: string
  text: string
}

function DetailRow({ icon, label, text }: DetailRowProps) {
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

export default function CompatibilityResult({ result, nameA, nameB, onReset }: CompatibilityResultProps) {
  const { tr } = useLang()

  const RATING_LABEL: Record<Rating, string> = {
    '◎': tr.ratingExcellent,
    '◯': tr.ratingGood,
    '△': tr.ratingOk,
    '×': tr.ratingCaution,
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const categories: CategoryCardProps[] = [
    { icon: '💕', title: tr.loveCat, data: result.love, delay: 100 },
    { icon: '💼', title: tr.workCat, data: result.work, delay: 200 },
    { icon: '🤝', title: tr.friendCat, data: result.friendship, delay: 300 },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="text-center py-2">
        <div className="inline-flex items-center gap-1.5 bg-pink-900/40 border border-pink-700/40 rounded-full px-3 py-1 text-xs text-pink-300 font-semibold mb-2">
          <span>💕</span>
          <span>相性鑑定結果</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1">
          {tr.compatResult(nameA, nameB)}
        </h2>
      </div>

      {/* Overall Score */}
      <div
        className={`glass-card p-6 border bg-gradient-to-br ${RATING_BG[result.overall_rating]} animate-slide-up`}
      >
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">{tr.compatScore}</p>

        {/* Score number */}
        <div className="flex flex-col items-center mb-5">
          <div className={`text-6xl font-black ${scoreColor(result.overall_score)}`}>
            {result.overall_score}
          </div>
          <p className={`text-sm font-bold mt-1 ${scoreColor(result.overall_score)}`}>点</p>
          <div className={`rating-large rating-large-${result.overall_rating} mt-3`}>
            {result.overall_rating}
          </div>
          <p className={`text-xl font-bold mt-2 rating-large-${result.overall_rating}`}>
            {RATING_LABEL[result.overall_rating]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${scoreBarColor(result.overall_score)} transition-all duration-1000`}
              style={{ width: `${result.overall_score}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-600 mt-1">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Overall comment */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-sm text-slate-300 leading-relaxed">{result.overall_comment}</p>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categories.map((cat) => (
          <CategoryCard key={cat.title} {...cat} />
        ))}
      </div>

      {/* Perspectives */}
      <div
        className="glass-card overflow-hidden animate-slide-up"
        style={{ animationDelay: '400ms', animationFillMode: 'both' }}
      >
        <div className="p-5 pb-0">
          <p className="text-sm font-semibold text-purple-300 mb-2">✦ {tr.perspectives}</p>
          <div className="mystic-divider" style={{ marginTop: 8, marginBottom: 0 }} />
        </div>
        <div className="px-5 pb-4">
          <DetailRow icon="⭐" label="六星占術" text={result.perspectives.rokusei} />
          <DetailRow icon="🩸" label="血液型占い" text={result.perspectives.blood_type} />
          <DetailRow icon="♈" label="西洋占星術" text={result.perspectives.zodiac} />
          <DetailRow icon="🔢" label="数秘術" text={result.perspectives.numerology} />
        </div>
      </div>

      {/* Lucky Action */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '480ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-pink-300 font-medium mb-3">{tr.luckyAction}</p>
        <div className="quote-block">{result.lucky_action}</div>
      </div>

      {/* Advice */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '540ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">💌 {tr.compatAdvice}</p>
        <p className="text-sm text-slate-300 leading-relaxed">{result.advice}</p>
      </div>

      {/* Reset Button */}
      <div className="text-center pt-2 pb-8">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-purple-900/30"
        >
          <span>💕</span>
          <span>{tr.compatReset}</span>
        </button>
      </div>
    </div>
  )
}
