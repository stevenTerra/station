import { FC } from "react"
import classNames from "classnames"
import { Color } from "types/components"
import { InlineFlex } from "../layout"
import styles from "./Tag.module.scss"

interface Props {
  color: Color
}

const Tag: FC<Props> = ({ color, children }) => {
  return (
    <InlineFlex className={classNames(styles.tag, `bg-${color}`)}>
      {children}
    </InlineFlex>
  )
}

export default Tag
