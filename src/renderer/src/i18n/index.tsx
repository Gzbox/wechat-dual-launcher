import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import zh from './zh'
import en from './en'
import type { Locale } from './zh'

type Lang = 'zh' | 'en'

const locales: Record<Lang, Locale> = { zh, en }

interface I18nContextValue {
  t: Locale
  lang: Lang
  setLang: (lang: Lang) => void
}

const I18nContext = createContext<I18nContextValue>({
  t: zh,
  lang: 'zh',
  setLang: () => {}
})

export function I18nProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [lang, setLangState] = useState<Lang>('zh')

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
  }, [])

  return (
    <I18nContext.Provider value={{ t: locales[lang], lang, setLang }}>
      {children}
    </I18nContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18nContextValue {
  return useContext(I18nContext)
}
