import { useCallback, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { atom, useRecoilState, useRecoilValue } from "recoil"
import { SettingKey } from "utils/localStorage"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"

export const languageState = atom({
  key: "language",
  default: getLocalSetting<string>(SettingKey.Language),
})

export const useLanguage = () => {
  const language = useRecoilValue(languageState)
  return language
}

export const useLanguageState = () => {
  const [language, setLanguage] = useRecoilState(languageState)
  const { i18n } = useTranslation()

  const set = useCallback(
    (language: string) => {
      i18n.changeLanguage(language)
      setLocalSetting(SettingKey.Language, language)
      setLanguage(language)
    },
    [i18n, setLanguage]
  )

  useEffect(() => {
    set(language)
  }, [language, set])

  return [language, set] as const
}
