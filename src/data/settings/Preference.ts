import { atom, useRecoilState } from "recoil"
import { getLocalSetting, setLocalSetting } from "utils/localStorage"
import { SettingKey } from "utils/localStorage"

const preferenceState = atom({
  key: "preferenceState",
  default: getLocalSetting<Preference>(SettingKey.Preference),
})

export const usePreference = () => {
  const [preference, setPreference] = useRecoilState(preferenceState)

  const updateSettings = (key: keyof Preference, value: any) => {
    const next = { ...preference, [key]: value }
    setPreference(next)
    setLocalSetting<Preference>(SettingKey.Preference, next)
  }

  const toggleHideSmallBalances = () => {
    updateSettings("hideSmallBalances", !preference.hideSmallBalances)
  }

  return { ...preference, toggleHideSmallBalances }
}
