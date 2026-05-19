'use client'

import { useState, useEffect } from 'react'
import type { FortuneResult, FortuneCategoryResult, TarotCard, Rating, FortunePeriod } from '@/lib/types'
import { formatDateJP, getWeekRange, getMonthRange } from '@/lib/calculations'
import { useLang } from '@/lib/i18n-context'

interface FortuneResultProps {
  result: FortuneResult
  name: string
  fortuneDate: string
  fortunePeriod?: FortunePeriod
  isPremium?: boolean
  onReset: () => void
  onUpgrade?: () => void
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
  cautionLabel: string
  actionLabel: string
}

function FortuneCategoryCard({ icon, title, data, delay = 0, cautionLabel, actionLabel }: FortuneCategoryCardProps) {
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
        <p className="text-xs text-slate-300 leading-relaxed">{data.flow}</p>
        <div className="flex gap-2">
          <span className="text-xs text-amber-400 font-semibold w-8 flex-shrink-0 pt-0.5">{cautionLabel}</span>
          <p className="text-xs text-slate-300 leading-relaxed">{data.caution}</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs text-emerald-400 font-semibold w-8 flex-shrink-0 pt-0.5">{actionLabel}</span>
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

export default function FortuneResult({
  result,
  name,
  fortuneDate,
  fortunePeriod = 'day',
  isPremium = false,
  onReset,
  onUpgrade,
}: FortuneResultProps) {
  const { tr } = useLang()
  const [showDetails, setShowDetails] = useState(false)

  const RATING_LABEL: Record<Rating, string> = {
    '◎': tr.ratingExcellent,
    '◯': tr.ratingGood,
    '△': tr.ratingOk,
    '×': tr.ratingCaution,
  }

  // 結果表示時に総合運が最初に見えるよう先頭へスクロール
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const periodBadge = fortunePeriod === 'week' ? tr.weekResult : fortunePeriod === 'month' ? tr.monthResult : tr.dayResult
  const periodIcon  = fortunePeriod === 'week' ? '📅' : fortunePeriod === 'month' ? '🌙' : '☀️'
  const dateLabel =
    fortunePeriod === 'week'
      ? `${getWeekRange(fortuneDate).label}${tr.weekDays}`
      : fortunePeriod === 'month'
      ? `${getMonthRange(fortuneDate).label}${tr.monthDays}`
      : formatDateJP(fortuneDate)

  const categories: FortuneCategoryCardProps[] = [
    { icon: '💼', title: tr.workFortune, data: result.work_fortune, delay: 100, cautionLabel: tr.caution, actionLabel: tr.action },
    { icon: '💰', title: tr.moneyFortune, data: result.money_fortune, delay: 200, cautionLabel: tr.caution, actionLabel: tr.action },
    { icon: '❤️', title: tr.loveFortune, data: result.love_fortune, delay: 300, cautionLabel: tr.caution, actionLabel: tr.action },
    { icon: '🌿', title: tr.healthFortune, data: result.health_fortune, delay: 400, cautionLabel: tr.caution, actionLabel: tr.action },
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
        <h2 className="text-xl font-bold text-white">{tr.fortuneTitle(name)}</h2>
      </div>

      {/* Overall Rating */}
      <div
        className={`glass-card p-6 border bg-gradient-to-br ${RATING_BG[result.overall_rating]} animate-slide-up`}
      >
        {/* Large rating symbol */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-3">{tr.overallFortune}</p>
        <div className="flex flex-col items-center mb-5">
          <div className={`rating-large rating-large-${result.overall_rating}`}>
            {result.overall_rating}
          </div>
          <p className={`text-xl font-bold mt-2 rating-large-${result.overall_rating}`}>
            {RATING_LABEL[result.overall_rating]}
          </p>
        </div>

        {/* Reason */}
        <div className="bg-white/5 rounded-xl p-3 mb-4">
          <p className="text-xs text-purple-300 font-semibold mb-1">{tr.ratingReason}</p>
          <p className="text-sm text-slate-300 leading-relaxed">{result.overall_reason}</p>
        </div>

        {/* Flow / Caution / Action */}
        <div className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{result.overall_flow}</p>
          <div className="flex gap-3">
            <span className="text-xs text-amber-400 font-semibold w-10 flex-shrink-0 pt-0.5">⚠️ {tr.caution}</span>
            <p className="text-sm text-slate-300 leading-relaxed">{result.overall_caution}</p>
          </div>
          <div className="flex gap-3">
            <span className="text-xs text-emerald-400 font-semibold w-10 flex-shrink-0 pt-0.5">✅ {tr.action}</span>
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

      {/* Tarot Reading */}
      {isPremium ? (
        result.tarot_reading && (
          <div
            className="glass-card p-5 animate-slide-up"
            style={{ animationDelay: '480ms', animationFillMode: 'both' }}
          >
            <p className="text-xs font-semibold text-purple-300 uppercase tracking-widest mb-4">
              {tr.tarotReading}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {([result.tarot_reading.card1, result.tarot_reading.card2, result.tarot_reading.card3] as TarotCard[]).map((card) => (
                <div key={card.role} className="flex flex-col items-center text-center">
                  {/* Card */}
                  <div className="w-full bg-gradient-to-b from-purple-900/60 to-indigo-900/60 border border-purple-700/40 rounded-xl p-3 mb-2">
                    <p className="text-xs text-purple-400 font-medium mb-2">{card.role}</p>
                    <p className="text-sm font-bold text-white leading-snug mb-1">{card.name.split('（')[0]}</p>
                    <p className="text-xs text-slate-500">{card.name.match(/（(.+)）/)?.[1] ?? ''}</p>
                    <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                      card.position === '正位置'
                        ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/40'
                        : 'bg-rose-900/50 text-rose-300 border border-rose-700/40'
                    }`}>
                      {card.position}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{card.meaning}</p>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-3">
              <p className="text-xs text-purple-300 font-medium mb-1">{tr.tarotSummary}</p>
              <p className="text-sm text-slate-300 leading-relaxed">{result.tarot_reading.summary}</p>
            </div>
          </div>
        )
      ) : (
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: '480ms', animationFillMode: 'both' }}
        >
          <p className="text-3xl mb-3">🔒</p>
          <p className="text-sm font-semibold text-purple-300 mb-1">{tr.tarotLockTitle}</p>
          <p className="text-xs text-slate-400 mb-4">{tr.premiumLock}</p>
          <button onClick={onUpgrade} className="btn-secondary text-xs px-4 py-2">
            {tr.upgradeBtn}
          </button>
        </div>
      )}

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
          <p className="text-xs text-purple-300 font-medium mb-0.5">{tr.luckyColor}</p>
          <p className="text-lg font-bold text-white">{result.lucky_color}</p>
        </div>
      </div>

      {/* Advice */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '550ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">{tr.adviceTitle}</p>
        <p className="text-sm text-slate-300 leading-relaxed">{result.advice}</p>
      </div>

      {/* Today's Word */}
      <div
        className="glass-card p-5 animate-slide-up"
        style={{ animationDelay: '600ms', animationFillMode: 'both' }}
      >
        <p className="text-xs text-purple-300 font-medium mb-3">
          {tr.todaysWord(fortunePeriod)}
        </p>
        <div className="quote-block">{result.todays_word}</div>
      </div>

      {/* Fortune Details (collapsible) */}
      {isPremium ? (
        result.fortune_details && (
          <div
            className="glass-card overflow-hidden animate-slide-up"
            style={{ animationDelay: '650ms', animationFillMode: 'both' }}
          >
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="w-full p-5 flex items-center justify-between text-left"
            >
              <span className="text-sm font-semibold text-purple-300">{tr.fortuneDetailsTitle}</span>
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
                <FortuneDetailRow icon="⭐" label={tr.detailRokusei} text={result.fortune_details.rokusei} />
                <FortuneDetailRow icon="♈" label={tr.detailZodiac} text={result.fortune_details.zodiac} />
                <FortuneDetailRow icon="🔢" label={tr.detailNumerology} text={result.fortune_details.numerology} />
                <FortuneDetailRow icon="📈" label={tr.detailBiorhythm} text={result.fortune_details.biorhythm} />
                <FortuneDetailRow icon="🀄" label={tr.detailShichu} text={result.fortune_details.shichusuimei} />
                <FortuneDetailRow icon="🩸" label={tr.detailBloodType} text={result.fortune_details.blood_type} />
              </div>
            )}
          </div>
        )
      ) : (
        <div
          className="glass-card p-6 text-center animate-slide-up"
          style={{ animationDelay: '650ms', animationFillMode: 'both' }}
        >
          <p className="text-3xl mb-3">🔒</p>
          <p className="text-sm font-semibold text-purple-300 mb-1">{tr.detailLockTitle}</p>
          <p className="text-xs text-slate-400 mb-4">{tr.detailLockDesc}</p>
          <button onClick={onUpgrade} className="btn-secondary text-xs px-4 py-2">
            {tr.upgradeBtn}
          </button>
        </div>
      )}

      {/* Reset Button */}
      <div className="text-center pt-2 pb-8">
        <button onClick={onReset} className="btn-primary">
          <span className="flex items-center gap-2">
            <span>🔮</span>
            <span>{tr.resetBtn.replace('🔮 ', '')}</span>
          </span>
        </button>
      </div>
    </div>
  )
}
