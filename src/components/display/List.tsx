import { ReactNode } from "react"
import ExternalLink from "../general/ExternalLink"
import styles from "./List.module.scss"

interface LinkItem {
  icon: ReactNode
  children: string
  href: string
}

interface ButtonItem {
  src?: string
  children: string
  onClick: () => void
}

type ListProps = (LinkItem | ButtonItem)[]

const List = ({ list }: { list: ListProps }) => {
  return (
    <>
      {list.map(({ children, ...item }) => {
        return "href" in item ? (
          <ExternalLink href={item.href} className={styles.item} key={children}>
            {children}
            {item.icon}
          </ExternalLink>
        ) : (
          <button
            type="button"
            className={styles.item}
            onClick={item.onClick}
            key={children}
          >
            {children}
            {item.src && <img src={item.src} alt="" width={24} height={24} />}
          </button>
        )
      })}
    </>
  )
}

export default List

interface Group {
  title: string
  list: ListProps
}

export const ListGroup = ({ groups }: { groups: Group[] }) => {
  return (
    <>
      {groups.map(({ title, list }) => (
        <article className={styles.group} key={title}>
          <h1 className={styles.title}>{title}</h1>
          <List list={list} />
        </article>
      ))}
    </>
  )
}
