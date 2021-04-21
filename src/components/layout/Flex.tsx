import { FC } from "react"
import classNames from "classnames/bind"
import styles from "./Flex.module.scss"

const cx = classNames.bind(styles)

interface Props {
  gap?: number
  className?: string
  start?: boolean
}

export const InlineFlex: FC<Props> = ({ gap, start, className, children }) => {
  return (
    <span className={cx(styles.inline, { start }, className)} style={{ gap }}>
      {children}
    </span>
  )
}

export const FlexColumn: FC<Props> = ({ gap, start, className, children }) => {
  return (
    <div className={cx(styles.column, { start }, className)} style={{ gap }}>
      {children}
    </div>
  )
}

const Flex: FC<Props> = ({ gap, start, className, children }) => {
  return (
    <div className={cx(styles.flex, { start }, className)} style={{ gap }}>
      {children}
    </div>
  )
}

export default Flex
