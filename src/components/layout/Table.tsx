import { CSSProperties, ReactNode, useMemo, useState } from "react"
import { path } from "ramda"
import classNames from "classnames/bind"
import { ReactComponent as DropUpIcon } from "styles/images/icons/DropUp.svg"
import { ReactComponent as DropDownIcon } from "styles/images/icons/DropDown.svg"
import Grid from "./Grid"
import styles from "./Table.module.scss"

const cx = classNames.bind(styles)

type SortOrder = "desc" | "asc"
type Sorter<T> = (a: T, b: T) => number

interface Column<T> {
  title?: string
  dataIndex?: string | string[]
  defaultSortOrder?: SortOrder
  sorter?: Sorter<T>
  render?: (value: any, record: T, index: number) => ReactNode
  key?: string

  align?: "left" | "center" | "right"
}

interface Props<T> {
  columns: Column<T>[]
  dataSource: T[]
  filter?: (record: T) => boolean
  sorter?: (a: T, b: T) => number
  rowKey?: (record: T) => string

  size?: "default" | "small"
  style?: CSSProperties
}

function Table<T>({ columns, dataSource, filter, rowKey, ...props }: Props<T>) {
  const { size = "default", style } = props

  const getClassName = ({ align }: Column<T>) => cx(align)
  const getKey = ({ dataIndex, key }: Column<T>) =>
    key ?? (typeof dataIndex === "string" ? dataIndex : dataIndex?.join() ?? "")

  const [sorterIndex, setSorterIndex] = useState<number>()
  const [sortOrder, setSortOrder] = useState<SortOrder>()

  const sorter = useMemo(() => {
    if (typeof sorterIndex !== "number") return
    const { sorter } = columns[sorterIndex]
    if (!sorter) throw new Error()

    return (a: T, b: T) => {
      return (sortOrder === "desc" ? -1 : 1) * sorter(a, b)
    }
  }, [columns, sortOrder, sorterIndex])

  const sort = (index: number) => {
    const { defaultSortOrder } = columns[index]
    const opposite = { asc: "desc" as const, desc: "asc" as const }
    const next =
      sorterIndex === index && sortOrder
        ? opposite[sortOrder]
        : defaultSortOrder

    setSorterIndex(index)
    setSortOrder(next)
  }

  return (
    <div className={styles.container} style={style}>
      <table className={cx(styles.table, size)}>
        <thead>
          <tr>
            {columns.map((column, index) => {
              const { title, sorter, defaultSortOrder } = column

              const getCaretAttrs = (key: SortOrder) => {
                const active = sorterIndex === index && sortOrder === key
                return {
                  className: cx(styles.caret, { active }),
                  width: 6,
                  height: 3,
                }
              }

              return (
                <th className={getClassName(column)} key={getKey(column)}>
                  {sorter && defaultSortOrder ? (
                    <button
                      className={styles.sorter}
                      onClick={() => sort(index)}
                    >
                      {title}

                      <Grid gap={4}>
                        <DropUpIcon {...getCaretAttrs("asc")} />
                        <DropDownIcon {...getCaretAttrs("desc")} />
                      </Grid>
                    </button>
                  ) : (
                    title
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {dataSource
            .filter((data) => filter?.(data) ?? true)
            .sort((a, b) => props.sorter?.(a, b) || sorter?.(a, b) || 0)
            .map((data, index) => (
              <tr key={rowKey?.(data) ?? index}>
                {columns.map((column, index) => {
                  const { dataIndex, render } = column
                  const value: any =
                    typeof dataIndex === "string"
                      ? data[dataIndex as keyof T]
                      : dataIndex
                      ? path(dataIndex, data)
                      : undefined

                  const children = render?.(value, data, index) ?? value

                  return (
                    <td className={getClassName(column)} key={getKey(column)}>
                      {children}
                    </td>
                  )
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
