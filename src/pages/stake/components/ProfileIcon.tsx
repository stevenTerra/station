import { useState } from "react"
import { Validator } from "@terra-money/terra.js"
import { ReactComponent as Terra } from "styles/images/Terra.svg"
import getProfileIcons from "./getProfileIcons"
import styles from "./ProfileIcon.module.scss"

interface Props {
  validator: Validator
  size: number
}

const ProfileIcon = ({ validator: { operator_address }, size }: Props) => {
  const src = getProfileIcons(operator_address)
  const [error, setError] = useState(false)
  const attrs = { className: styles.icon, width: size, height: size }
  if (error || !src) return <Terra {...attrs} />
  return <img {...attrs} src={src} onError={() => setError(true)} alt="" />
}

export default ProfileIcon
