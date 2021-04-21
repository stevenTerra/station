import { FC, ReactNode } from "react"
import { Link, To } from "react-router-dom"
import classNames from "classnames/bind"
import ErrorBoundary from "../feedback/ErrorBoundary"
import { WithFetching } from "../feedback/Fetching"
import styles from "./Card.module.scss"

const cx = classNames.bind(styles)

export interface Props extends QueryState {
  title?: ReactNode
  extra?: ReactNode

  /* customize */
  size?: "small"
  bordered?: boolean
  bg?: boolean

  className?: string
  mainClassName?: string

  /* button */
  onClick?: () => void
  disabled?: boolean

  /* link */
  to?: To
}

const Card: FC<Props> = ({ title, extra, children, onClick, to, ...props }) => {
  const { size, bordered, bg, disabled, className, mainClassName } = props

  return (
    <WithFetching {...props} height={2}>
      {(progress, wrong) => {
        const style = {
          bordered,
          bg,
          default: !bordered,
          grid: (title || extra) && (children || wrong),
          link: to,
          button: onClick,
          error: wrong,
        }

        const cardClassName = cx(styles.card, size, style, className)

        const content = (
          <>
            {progress}

            {(title || extra) && (
              <header className={styles.header}>
                <h1 className={styles.title}>{title}</h1>
                <section className={styles.extra}>{extra}</section>
              </header>
            )}

            <section className={classNames(styles.main, mainClassName)}>
              {wrong ?? (children && <ErrorBoundary>{children}</ErrorBoundary>)}
            </section>
          </>
        )

        return to ? (
          <Link to={to} className={cardClassName}>
            {content}
          </Link>
        ) : onClick ? (
          <button
            className={cardClassName}
            onClick={onClick}
            disabled={disabled}
          >
            {content}
          </button>
        ) : (
          <article className={cardClassName}>{content}</article>
        )
      }}
    </WithFetching>
  )
}

export default Card
