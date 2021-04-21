import { Flex } from "components/layout"
import { Fetching, Empty } from "components/feedback"
import CWTokenItem, { CWTokenItemProps } from "./CWTokenItem"
import styles from "./CWTokenList.module.scss"

interface Props<T> extends QueryState {
  results: T[]
  renderTokenItem: (item: T) => CWTokenItemProps

  /* manage custom tokens */
  list: T[]
  getIsAdded: (item: T) => boolean
  add: (item: T) => void
  remove: (item: T) => void
}

function CWTokenList<T extends TokenItem | CW721ContractItem>(props: Props<T>) {
  const { list, getIsAdded, add, remove, ...rest } = props
  const { results, renderTokenItem, ...state } = rest
  const empty = !state.isLoading && !results.length

  return state.error || empty ? (
    <Flex className={styles.results}>
      <Empty />
    </Flex>
  ) : (
    <Fetching {...state} height={2}>
      <ul className={styles.results}>
        {results
          .sort((a, b) => Number(getIsAdded(b)) - Number(getIsAdded(a)))
          .map((item) => (
            <li key={item.symbol}>
              <CWTokenItem
                {...renderTokenItem(item)}
                added={getIsAdded(item)}
                onAdd={() => add(item)}
                onRemove={() => remove(item)}
              />
            </li>
          ))}
      </ul>
    </Fetching>
  )
}

export default CWTokenList
