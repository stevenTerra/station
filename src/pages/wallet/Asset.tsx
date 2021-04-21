import { useRecoilValue } from "recoil"
import ERROR from "config/ERROR"
import { currencyState } from "data/settings/Currency"
import { Flex } from "components/layout"
import { WithFetching } from "components/feedback"
import { Read, TokenIcon } from "components/token"
import AssetActions from "./AssetActions"
import styles from "./Asset.module.scss"

export interface Props extends TokenItem, QueryState {
  balance?: Amount
  value?: Value
}

const Asset = (props: Props) => {
  const { token, icon, symbol, balance, value, ...state } = props
  const currency = useRecoilValue(currencyState)

  return (
    <article className={styles.asset} key={token}>
      <Flex gap={10} className={styles.details}>
        <TokenIcon token={token} icon={icon} size={22} />

        <div>
          <h1 className={styles.symbol}>{symbol}</h1>
          <h2 className={styles.amount}>
            <WithFetching {...state} height={1}>
              {(progress, wrong) => (
                <>
                  {progress}
                  {wrong ? (
                    <span className="danger">
                      {ERROR.TOKENS.QUERY_BALANCE_FAILED}
                    </span>
                  ) : (
                    <Read {...props} amount={balance} token="" />
                  )}
                </>
              )}
            </WithFetching>
          </h2>

          {token !== currency && value && (
            <p className={styles.value}>
              <Read amount={value} token={currency} auto approx />
            </p>
          )}
        </div>
      </Flex>

      <AssetActions {...props} />
    </article>
  )
}

export default Asset
