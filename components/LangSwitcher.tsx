'use client'
import { useLang } from '@/lib/i18n-context'
import { LANGS } from '@/lib/i18n'

export default function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div className="flex gap-1">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          title={label}
          className={`text-sm px-2 py-1 rounded-lg transition-all ${
            lang === code
              ? 'bg-purple-600/60 text-white'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {flag}
        </button>
      ))}
    </div>
  )
}
