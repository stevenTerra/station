import { InputHTMLAttributes } from "react"
import classNames from "classnames/bind"
import styles from "./Checkbox.module.scss"

const cx = classNames.bind(styles)

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  disabled?: boolean
}

const Checkbox = ({ className, children, ...attrs }: Props) => {
  const { checked, disabled } = attrs
  return (
    <label className={cx(styles.checkbox, { checked, disabled }, className)}>
      <input {...attrs} type="checkbox" hidden />
      <span className={styles.track}>
        <span className={styles.indicator} />
      </span>
      <span className={styles.text}>{children}</span>
    </label>
  )
}

export default Checkbox
