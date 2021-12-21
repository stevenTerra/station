import { HTMLAttributes, ReactNode } from "react"
import { Link, LinkProps } from "react-router-dom"
import classNames from "classnames/bind"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import styles from "./Internal.module.scss"

const cx = classNames.bind(styles)

interface Props {
  icon?: ReactNode
  chevron?: boolean
  disabled?: boolean
}

interface InternalButtonProps
  extends Props,
    HTMLAttributes<HTMLButtonElement> {}

export const InternalButton = (attrs: InternalButtonProps) => {
  return <button {...attrs} {...render(attrs)} type="button" />
}

interface InternalLinkProps extends Props, LinkProps {}

export const InternalLink = (props: InternalLinkProps) => {
  return props.disabled ? (
    <span {...props} {...render(props)} />
  ) : (
    <Link {...props} {...render(props)} />
  )
}

/* helpers */
const render = (props: InternalLinkProps | InternalButtonProps) => {
  const { icon, chevron, children, disabled } = props

  return {
    className: cx(styles.item, { disabled }),
    children: (
      <>
        <span className={styles.icon}>{icon}</span>
        {children}
        {chevron && (
          <span className={styles.chevron}>
            <ChevronRightIcon style={{ fontSize: 16 }} />
          </span>
        )}
      </>
    ),
  }
}
