import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { Dictionary } from "ramda"
import { debug } from "utils/env"
import es from "./es.json"
import fr from "./fr.json"
import ita from "./ita.json"
import ko from "./ko.json"
import pl from "./pl.json"
import ru from "./ru.json"
import zh from "./zh.json"

const flatten = (obj: object, initial = {}): Dictionary<string> => {
  return Object.entries(obj).reduce((prev, [key, value]) => {
    const next =
      typeof value === "string" ? { [key]: value } : flatten(value, prev)
    return Object.assign({}, prev, next)
  }, initial)
}

export const Languages = {
  en: { value: "en", label: "English", translation: {} },
  es: { value: "es", label: "Español", translation: flatten(es) },
  fr: { value: "fr", label: "Français", translation: flatten(fr) },
  ita: { value: "ita", label: "Italiano", translation: flatten(ita) },
  ko: { value: "ko", label: "한국어", translation: flatten(ko) },
  pl: { value: "pl", label: "Polish", translation: flatten(pl) },
  ru: { value: "ru", label: "Русский", translation: flatten(ru) },
  zh: { value: "zh", label: "中文", translation: flatten(zh) },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({ resources: Languages, lng: "en", debug: !!debug.translation })
