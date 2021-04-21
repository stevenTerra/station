import classNames from "classnames/bind"
import styles from "./Pre.module.scss"

const cx = classNames.bind(styles)

interface Props {
  height: number
  children: any
  normal?: boolean
}

const Pre = ({ height, children, normal }: Props) => {
  return (
    <pre style={{ height }} className={cx(styles.pre, { normal })}>
      {JSON.stringify(children, null, 2)}
    </pre>
  )
}

export default Pre
