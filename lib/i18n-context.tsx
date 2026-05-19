'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Lang, t, Translations } from './i18n'

interface LangContextType {
  lang: Lang
  setLang: (l: Lang) => void
  tr: Translations
}

const LangContext = createContext<LangContextType>({
  lang: 'ja',
  setLang: () => {},
  tr: t.ja,
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ja')

  useEffect(() => {
    const saved = localStorage.getItem('fortune_lang') as Lang | null
    if (saved && t[saved]) setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('fortune_lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, tr: t[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
