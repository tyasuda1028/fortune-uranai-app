'use client'

import { useState, useEffect, useCallback } from 'react'
import { UserButton, SignInButton, useUser } from '@clerk/nextjs'
import FortuneForm from '@/components/FortuneForm'
import FortuneResult from '@/components/FortuneResult'
import LoadingView from '@/components/LoadingView'
import ProfileSelector from '@/components/ProfileSelector'
import CompatibilityForm from '@/components/CompatibilityForm'
import CompatibilityResult from '@/components/CompatibilityResult'
import LangSwitcher from '@/components/LangSwitcher'
import Link from 'next/link'
import { FortuneFormData, FortuneResult as FortuneResultType, SavedProfile, CompatibilityResult as CompatibilityResultType, CompatibilityPerson } from '@/lib/types'
import { getTodayString, calcRokuseiStar } from '@/lib/calculations'
import { useLang } from '@/lib/i18n-context'

type Step = 'form' | 'loading' | 'result'
type Mode = 'fortune' | 'compatibility'

const STAR_COUNT = 80
const PROFILES_KEY = 'fortune_profiles'
const LEGACY_PROFILE_KEY = 'fortune_profile'

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

/** localStorage からプロフィール配列を読み込む（旧形式も移行） */
function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    if (raw) return JSON.parse(raw) as SavedProfile[]

    // 旧形式からの移行
    const legacy = localStorage.getItem(LEGACY_PROFILE_KEY)
    if (legacy) {
      const p = JSON.parse(legacy)
      if (p.name && p.birthdate) {
        const migrated: SavedProfile = {
          id: 'profile_migrated',
          label: '自分',
          name: p.name,
          birthdate: p.birthdate,
          bloodType: p.bloodType ?? 'A',
          rokuseiStar: p.rokuseiStar ?? '',
          isReigoSeijin: p.isReigoSeijin ?? false,
        }
        localStorage.setItem(PROFILES_KEY, JSON.stringify([migrated]))
        return [migrated]
      }
    }
  } catch { /* ignore */ }
  return []
}

function saveProfiles(profiles: SavedProfile[]) {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  } catch { /* ignore */ }
}

export default function Home() {
  const { user, isLoaded } = useUser()
  const { tr, lang } = useLang()
  const [mode, setMode] = useState<Mode>('fortune')
  const [step, setStep] = useState<Step>('form')
  const [result, setResult] = useState<FortuneResultType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)

  const [profiles, setProfiles] = useState<SavedProfile[]>([])
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null)

  // Compatibility state
  const [compatibilityStep, setCompatibilityStep] = useState<'form' | 'loading' | 'result'>('form')
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResultType | null>(null)
  const [compatibilityPersonA, setCompatibilityPersonA] = useState<CompatibilityPerson | null>(null)
  const [compatibilityPersonB, setCompatibilityPersonB] = useState<CompatibilityPerson | null>(null)

  const [formData, setFormData] = useState<FortuneFormData>({
    name: '',
    birthdate: '',
    bloodType: 'A',
    rokuseiStar: '',
    isReigoSeijin: false,
    question: '',
    fortuneDate: getTodayString(),
    fortunePeriod: 'day',
  })

  // ?success=true 確認
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('success') === 'true') {
        setShowSuccessToast(true)
        window.history.replaceState({}, '', window.location.pathname)
        setTimeout(() => setShowSuccessToast(false), 5000)
      }
    }
  }, [])

  // 初回マウント: プロフィール読み込み
  useEffect(() => {
    const loaded = loadProfiles()
    setProfiles(loaded)
    // 最初のプロフィールを自動選択してフォームに反映
    if (loaded.length > 0) {
      const first = loaded[0]
      setSelectedProfileId(first.id)
      applyProfile(first)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clerkサインイン後、名前が未設定なら自動補完
  useEffect(() => {
    if (isLoaded && user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.fullName || user.firstName || '',
      }))
    }
  }, [isLoaded, user])

  function applyProfile(profile: SavedProfile) {
    setFormData(prev => ({
      ...prev,
      name: profile.name,
      birthdate: profile.birthdate,
      bloodType: profile.bloodType,
      rokuseiStar: profile.rokuseiStar || (profile.birthdate ? calcRokuseiStar(profile.birthdate) : ''),
      isReigoSeijin: profile.isReigoSeijin,
    }))
  }

  const handleSelectProfile = (profile: SavedProfile) => {
    setSelectedProfileId(profile.id)
    applyProfile(profile)
  }

  const handleSaveProfile = (profile: SavedProfile) => {
    setProfiles(prev => {
      const exists = prev.find(p => p.id === profile.id)
      const updated = exists
        ? prev.map(p => p.id === profile.id ? profile : p)
        : [...prev, profile]
      saveProfiles(updated)
      return updated
    })
    // 保存後に選択状態にして反映
    setSelectedProfileId(profile.id)
    applyProfile(profile)
  }

  const handleDeleteProfile = (id: string) => {
    setProfiles(prev => {
      const updated = prev.filter(p => p.id !== id)
      saveProfiles(updated)
      return updated
    })
    if (selectedProfileId === id) {
      setSelectedProfileId(null)
    }
  }

  const handleUpgrade = useCallback(async () => {
    try {
      const res = await fetch('/api/paypal/create-subscription', { method: 'POST' })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        setError(json.error || 'サブスクリプションの作成に失敗しました。')
      }
    } catch {
      setError('サブスクリプションの作成に失敗しました。')
    }
  }, [])

  const handleCancelSubscription = useCallback(async () => {
    if (!confirm('プレミアムプランを解約しますか？\n解約後は無料プランに戻ります。')) return
    try {
      const res = await fetch('/api/paypal/cancel', { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setIsPremium(false)
        setUsageRemaining(null)
      } else {
        setError(json.error || '解約に失敗しました。')
      }
    } catch {
      setError('解約に失敗しました。')
    }
  }, [])

  const handleSubmit = async (data: FortuneFormData) => {
    setFormData(data)
    setStep('loading')
    setError(null)

    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, lang }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error(tr.loginRequired)
        }
        if (json.code === 'USAGE_LIMIT') {
          setError(json.error)
          setStep('form')
          return
        }
        throw new Error(json.error || '占いの実行に失敗しました。')
      }

      if (json.plan === 'premium') {
        setIsPremium(true)
        setUsageRemaining(null)
      } else {
        setIsPremium(false)
        setUsageRemaining(typeof json.usageRemaining === 'number' ? json.usageRemaining : null)
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

  const handleCompatibilitySubmit = async (personA: CompatibilityPerson, personB: CompatibilityPerson) => {
    setCompatibilityPersonA(personA)
    setCompatibilityPersonB(personB)
    setCompatibilityStep('loading')
    setError(null)
    try {
      const res = await fetch('/api/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personA, personB, lang }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || '相性占いに失敗しました。')
      setCompatibilityResult(json)
      setCompatibilityStep('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました。')
      setCompatibilityStep('form')
    }
  }

  return (
    <main className="relative min-h-screen">
      <StarsBackground />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-purple-900/90 border border-purple-500/60 rounded-2xl px-5 py-3 shadow-lg animate-fade-in">
          <p className="text-sm text-white font-semibold">🎉 プレミアム登録完了！</p>
          <p className="text-xs text-purple-300 mt-0.5">すべての機能が使えるようになりました</p>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-10 max-w-xl">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          {/* Auth bar */}
          <div className="flex justify-between items-center mb-4">
            <LangSwitcher />
            {isLoaded && (
              user ? (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {isPremium ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-purple-600 to-amber-500 text-white rounded-full px-3 py-1">
                        {tr.premium}
                      </span>
                      <button
                        onClick={handleCancelSubscription}
                        className="text-xs text-slate-500 hover:text-rose-400 transition-colors underline"
                      >
                        解約
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {usageRemaining !== null && (
                        <span className="text-xs text-slate-400">{tr.remaining(usageRemaining)}</span>
                      )}
                      <button
                        onClick={handleUpgrade}
                        className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full px-3 py-1.5 transition-all font-semibold"
                      >
                        {tr.upgrade}
                      </button>
                    </div>
                  )}
                  <span className="text-xs text-slate-400">{user.fullName || user.primaryEmailAddress?.emailAddress}</span>
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="text-xs text-purple-400 hover:text-purple-300 border border-purple-700/40 hover:border-purple-500/60 rounded-full px-3 py-1.5 transition-colors">
                    {tr.login}
                  </button>
                </SignInButton>
              )
            )}
          </div>
          <div className="text-5xl mb-3 animate-float">✨</div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
            {mode === 'fortune' ? tr.appName : tr.tabCompatibility.replace('🔮 ', '').replace('💕 ', '')}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
            {mode === 'fortune' ? tr.appDesc : (
              lang === 'ja'
                ? <>六星占術・星座・数秘術・血液型占いで<br />2人の相性を多角的に鑑定</>
                : lang === 'en'
                ? 'Six-Star · Zodiac · Numerology · Blood Type\nMulti-angle compatibility reading'
                : lang === 'zh-TW'
                ? '六星占術・星座・數秘術・血型\n多角度鑑定兩人相性'
                : '六星占术・星座・数秘术・血型\n多角度鉴定两人相性'
            )}
          </p>
        </header>

        {/* Mode tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode('fortune'); setError(null) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              mode === 'fortune'
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'border-purple-900/40 text-slate-400 hover:border-purple-500/50'
            }`}
          >
            {tr.tabFortune}
          </button>
          <button
            onClick={() => { setMode('compatibility'); setError(null) }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              mode === 'compatibility'
                ? 'bg-pink-700 border-pink-600 text-white'
                : 'border-purple-900/40 text-slate-400 hover:border-purple-500/50'
            }`}
          >
            {tr.tabCompatibility}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="glass-card p-4 mb-5 border border-rose-500/30 bg-rose-900/10 animate-fade-in">
            <p className="text-sm text-rose-300 flex items-start gap-2">
              <span>{tr.errorPrefix}</span>
              <span>{error}</span>
            </p>
            {error.includes('無料枠') && (
              <button
                onClick={handleUpgrade}
                className="mt-3 w-full text-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl px-4 py-2.5 transition-all font-semibold"
              >
                {tr.upgradeError}
              </button>
            )}
          </div>
        )}

        {/* Main content */}
        {mode === 'fortune' && (
          <>
            {step === 'form' && (
              <>
                {!isLoaded || !user ? (
                  <div className="glass-card p-6 mb-5 text-center animate-fade-in">
                    <p className="text-sm text-slate-300 mb-3">{tr.loginRequired}</p>
                    <SignInButton mode="modal">
                      <button className="btn-primary text-sm">
                        {tr.loginBtn}
                      </button>
                    </SignInButton>
                  </div>
                ) : null}

                {/* プロフィール選択 */}
                <ProfileSelector
                  profiles={profiles}
                  selectedId={selectedProfileId}
                  onSelect={handleSelectProfile}
                  onSave={handleSaveProfile}
                  onDelete={handleDeleteProfile}
                />

                <FortuneForm
                  key={selectedProfileId ?? 'no-profile'}
                  initialData={formData}
                  onSubmit={handleSubmit}
                />
              </>
            )}
            {step === 'loading' && <LoadingView />}
            {step === 'result' && result && (
              <FortuneResult
                result={result}
                name={formData.name}
                fortuneDate={formData.fortuneDate}
                fortunePeriod={formData.fortunePeriod}
                isPremium={isPremium}
                onReset={handleReset}
                onUpgrade={handleUpgrade}
              />
            )}
          </>
        )}

        {mode === 'compatibility' && (
          <>
            {!isLoaded || !user ? (
              <div className="glass-card p-6 mb-5 text-center animate-fade-in">
                <p className="text-sm text-slate-300 mb-3">{tr.loginRequired}</p>
                <SignInButton mode="modal">
                  <button className="btn-primary text-sm">
                    {tr.loginBtn}
                  </button>
                </SignInButton>
              </div>
            ) : null}

            {compatibilityStep === 'form' && (
              <CompatibilityForm profiles={profiles} onSubmit={handleCompatibilitySubmit} />
            )}
            {compatibilityStep === 'loading' && <LoadingView />}
            {compatibilityStep === 'result' && compatibilityResult && (
              <CompatibilityResult
                result={compatibilityResult}
                nameA={compatibilityPersonA?.name ?? ''}
                nameB={compatibilityPersonB?.name ?? ''}
                onReset={() => { setCompatibilityResult(null); setCompatibilityStep('form') }}
              />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 pt-2">
        <div className="flex items-center justify-center gap-4 text-xs text-slate-600">
          <Link href="/terms" className="hover:text-slate-400 transition-colors">{tr.terms}</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-slate-400 transition-colors">{tr.privacy}</Link>
          <span>·</span>
          <Link href="/legal" className="hover:text-slate-400 transition-colors">{tr.legal}</Link>
        </div>
        <p className="text-xs text-slate-700 mt-2">{tr.copyright}</p>
      </footer>
    </main>
  )
}
