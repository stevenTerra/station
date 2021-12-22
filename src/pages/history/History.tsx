import { Fragment, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useInfiniteQuery } from "react-query"
import axios from "axios"
import { API } from "config/constants"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { Button } from "components/general"
import { Card, Col, Page } from "components/layout"
import { Empty } from "components/feedback"
import TxItem from "./TxItem"

const History = () => {
  const { t } = useTranslation()
  const address = useAddress()

  /* query */
  const fetchAccountHistory = useCallback(
    async ({ pageParam = 0 }) => {
      const { data } = await axios.get<AccountHistory>(
        `tx-history/station/${address}`,
        { baseURL: API, params: { offset: pageParam || undefined } }
      )

      return data
    },
    [address]
  )

  const { data, error, fetchNextPage, ...state } = useInfiniteQuery(
    [queryKey.TerraAPI, "history", address],
    fetchAccountHistory,
    { getNextPageParam: ({ next }) => next, enabled: !!address }
  )

  const { hasNextPage, isFetchingNextPage } = state

  if (address && !data) return null

  const getPages = () => {
    if (!data) return []
    const { pages } = data
    const [{ list }] = data.pages
    return list.length ? pages : []
  }

  const pages = getPages()

  return (
    <Page {...state} title={t("History")}>
      {!pages.length ? (
        <Card>
          <Empty />
        </Card>
      ) : (
        <Col>
          {pages.map(({ list }, i) => (
            <Fragment key={i}>
              {list.map((item) => (
                <TxItem {...item} key={item.txhash} />
              ))}
            </Fragment>
          ))}

          <Button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            loading={isFetchingNextPage}
            block
          >
            {isFetchingNextPage
              ? t("Loading more...")
              : hasNextPage
              ? t("Load more")
              : t("Nothing more to load")}
          </Button>
        </Col>
      )}
    </Page>
  )
}

export default History
