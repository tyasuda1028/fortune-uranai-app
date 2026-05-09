'use client'

import { useState, useEffect } from 'react'
import { FortuneFormData, BloodType, RokuseiStar } from '@/lib/types'
import { calcRokuseiStar, getZodiacSign, getTodayString } from '@/lib/calculations'

interface FortuneFormProps {
  initialData: FortuneFormData
  onSubmit: (data: FortuneFormData) => void
  isLoading: boolean
}

const BLOOD_TYPES: BloodType[] = ['A', 'B', 'O', 'AB']

const ROKUSEI_STARS: RokuseiStar[] = [
  '木星人（＋）', '木星人（−）',
  '水星人（＋）', '水星人（−）',
  '土星人（＋）', '土星人（−）',
  '金星人（＋）', '金星人（−）',
  '火星人（＋）', '火星人（−）',
  '天王星人（＋）', '天王星人（−）',
]

export default function FortuneForm({ initialData, onSubmit, isLoading }: FortuneFormProps) {
  const [data, setData] = useState<FortuneFormData>(initialData)
  const [zodiac, setZodiac] = useState('')
  const [autoStar, setAutoStar] = useState('')

  useEffect(() => {
    if (data.birthdate) {
      setZodiac(getZodiacSign(data.birthdate))
      const star = calcRokuseiStar(data.birthdate)
      setAutoStar(star)
    }
  }, [data.birthdate])

  const set = <K extends keyof FortuneFormData>(key: K, value: FortuneFormData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const handleApplyAutoStar = () => {
    if (autoStar) set('rokuseiStar', autoStar as RokuseiStar)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Basic Info */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-widest flex items-center gap-2">
          <span>✦</span> 基本情報
        </h2>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            お名前 <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            className="fortune-input"
            placeholder="山田 太郎"
            value={data.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            生年月日 <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            className="fortune-input fortune-select"
            value={data.birthdate}
            max={getTodayString()}
            onChange={(e) => set('birthdate', e.target.value)}
            required
          />
          {data.birthdate && zodiac && (
            <p className="mt-1.5 text-xs text-purple-300">
              星座: <span className="font-semibold">{zodiac}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            血液型 <span className="text-rose-400">*</span>
          </label>
          <div className="flex gap-2">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                type="button"
                onClick={() => set('bloodType', bt)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  data.bloodType === bt
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/30'
                    : 'border-purple-900/40 text-slate-400 hover:border-purple-500/50 hover:text-slate-300'
                }`}
              >
                {bt}型
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fortune Settings */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-widest flex items-center gap-2">
          <span>✦</span> 占術設定
        </h2>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs text-slate-400 font-medium">
              六星占術の星 <span className="text-rose-400">*</span>
            </label>
            {autoStar && (
              <button
                type="button"
                onClick={handleApplyAutoStar}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2"
              >
                自動計算: {autoStar}
              </button>
            )}
          </div>
          <select
            className="fortune-input fortune-select"
            value={data.rokuseiStar}
            onChange={(e) => set('rokuseiStar', e.target.value as RokuseiStar)}
            required
          >
            <option value="" disabled>選択してください</option>
            {ROKUSEI_STARS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="reigo"
            className="fortune-checkbox"
            checked={data.isReigoSeijin}
            onChange={(e) => set('isReigoSeijin', e.target.checked)}
          />
          <label htmlFor="reigo" className="text-sm text-slate-300 cursor-pointer">
            霊合星人です（節分前後生まれ）
          </label>
        </div>
      </div>

      {/* Question & Date */}
      <div className="glass-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-purple-300 uppercase tracking-widest flex items-center gap-2">
          <span>✦</span> 占いの詳細
        </h2>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            占いたい日付 <span className="text-rose-400">*</span>
          </label>
          <input
            type="date"
            className="fortune-input fortune-select"
            value={data.fortuneDate}
            onChange={(e) => set('fortuneDate', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1.5 font-medium">
            今日のご質問・お悩み
            <span className="text-slate-600 ml-1">（任意）</span>
          </label>
          <textarea
            className="fortune-input resize-none"
            rows={3}
            placeholder="仕事のこと、恋愛のこと、気になっていることを書いてください..."
            value={data.question}
            onChange={(e) => set('question', e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center justify-center gap-2">
          <span>🔮</span>
          <span>占う</span>
        </span>
      </button>
    </form>
  )
}
