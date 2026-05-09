'use client'

import { useState, useEffect } from 'react'
import FortuneForm from '@/components/FortuneForm'
import FortuneResult from '@/components/FortuneResult'
import LoadingView from '@/components/LoadingView'
import { FortuneFormData, FortuneResult as FortuneResultType } from '@/lib/types'
import { calcRokuseiStar, getTodayString } from '@/lib/calculations'

type Step = 'form' | 'loading' | 'result'

const STAR_COUNT = 80

function StarsBackground() {
  const [stars, setStars] = useState<Array<{
    id: number; size: number; x: number; y: number; dur: number; delay: number
  }>>([])

  useEffect(() => {
    setStars(
      Array.from({ length: STAR_COUNT }, (_, i) => ({
        id: i,
        size: Math.random() * 2.5 + 0.5,
        x: Math.random() * 100,
        y: Math.random() * 100,
        dur: Math.random() * 4 + 2,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  return (
    <div className="stars-container">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            width: s.size,
            height: s.size,
            left: `${s.x}%`,
            top: `${s.y}%`,
            '--dur': `${s.dur}s`,
            '--delay': `${s.delay}s`,
          } as React.CSSProperties}
        />
      ))}
      {/* Nebula gradients */}
      <div
        className="absolute rounded-full opacity-10 blur-3xl"
        style={{ width: 500, height: 500, top: '10%', left: '60%', background: 'radial-gradient(circle, #7c3aed, transparent)' }}
      />
      <div
        className="absolute rounded-full opacity-8 blur-3xl"
        style={{ width: 400, height: 400, bottom: '20%', left: '-5%', background: 'radial-gradient(circle, #4f46e5, transparent)' }}
      />
    </div>
  )
}

export default function Home() {
  const [step, setStep] = useState<Step>('form')
  const [result, setResult] = useState<FortuneResultType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FortuneFormData>({
    name: '',
    birthdate: '',
    bloodType: 'A',
    rokuseiStar: '木星人（−）',
    isReigoSeijin: false,
    question: '',
    fortuneDate: getTodayString(),
  })

  // Set initial rokusei star when birthdate changes (via page load)
  useEffect(() => {
    if (formData.birthdate) {
      setFormData((prev) => ({
        ...prev,
        rokuseiStar: calcRokuseiStar(prev.birthdate),
      }))
    }
  }, [formData.birthdate]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (data: FortuneFormData) => {
    setFormData(data)
    setStep('loading')
    setError(null)

    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || '占いの実行に失敗しました。')
      }

      setResult(json)
      setStep('result')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '不明なエラーが発生しました。'
      setError(msg)
      setStep('form')
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setStep('form')
  }

  return (
    <main className="relative min-h-screen">
      <StarsBackground />

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-xl">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3 animate-float">✨</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            運勢占い
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            六星占術・西洋占星術・数秘術・バイオリズム<br />
            複数の占術を組み合わせた総合鑑定
          </p>
        </header>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-5 border border-rose-500/30 bg-rose-900/10 animate-fade-in">
            <p className="text-sm text-rose-300 flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </p>
          </div>
        )}

        {/* Main content */}
        {step === 'form' && (
          <FortuneForm
            initialData={formData}
            onSubmit={handleSubmit}
            isLoading={false}
          />
        )}
        {step === 'loading' && <LoadingView />}
        {step === 'result' && result && (
          <FortuneResult
            result={result}
            name={formData.name}
            fortuneDate={formData.fortuneDate}
            onReset={handleReset}
          />
        )}
      </div>
    </main>
  )
}
