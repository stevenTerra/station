import { useTranslation } from "react-i18next"
import BigNumber from "bignumber.js"
import BoltIcon from "@mui/icons-material/Bolt"
import { has } from "utils/num"
import { getAmount, sortByDenom } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { usePreference } from "data/settings/Preference"
import { readNativeDenom } from "data/token"
import { useBankBalance } from "data/queries/bank"
import { useIsWalletEmpty, useTerraNativeLength } from "data/queries/bank"
import { useActiveDenoms } from "data/queries/oracle"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { InternalLink } from "components/general"
import { Card, Grid } from "components/layout"
import { FormError, Checkbox } from "components/form"
import { Read } from "components/token"
import Asset from "./Asset"
import styles from "./TerraNativeAssets.module.scss"

const TerraNativeAssets = () => {
  const { t } = useTranslation()
  const { hideSmallBalances, toggleHideSmallBalances } = usePreference()
  const currency = useCurrency()
  const bankBalance = useBankBalance()
  const length = useTerraNativeLength()
  const isWalletEmpty = useIsWalletEmpty()
  const { data: denoms, ...state } = useActiveDenoms()
  const calcValue = useMemoizedCalcValue()
  const calcValueByUST = useMemoizedCalcValue("uusd")

  const render = () => {
    if (!denoms) return null

    const nativeTokenValues = denoms
      .map((denom) => {
        const balance = getAmount(bankBalance, denom)
        const value = calcValue({ amount: balance, denom }) ?? 0
        const valueByUST = calcValueByUST({ amount: balance, denom }) ?? 0
        return { denom, balance, value: value, $: valueByUST }
      })
      .filter(
        ({ denom, balance }) =>
          ["uluna", "uusd"].includes(denom) || has(balance)
      )

    const list = sortByDenom(
      nativeTokenValues,
      currency,
      ({ $: a }, { $: b }) => b - a
    )

    const listNotSmall = list.filter(({ $ }) => $ >= 1e6)

    const values = list.map(({ value }) => value).filter(Boolean)
    const valueTotal = values.length ? BigNumber.sum(...values).toNumber() : 0

    return (
      <>
        <Read
          className={styles.total}
          amount={valueTotal}
          token={currency}
          auto
          approx
        />

        <Grid gap={12}>
          {isWalletEmpty && (
            <FormError>
              {t(
                "This wallet does not hold any coins, so the transaction could not be processed."
              )}
            </FormError>
          )}

          {!isWalletEmpty && (
            <Checkbox
              checked={hideSmallBalances}
              onChange={toggleHideSmallBalances}
              disabled={!listNotSmall.length}
            >
              {t("Hide small balances")}
            </Checkbox>
          )}

          <section>
            {(hideSmallBalances ? listNotSmall : list).map(
              ({ denom, ...item }) => (
                <Asset {...readNativeDenom(denom)} {...item} key={denom} />
              )
            )}
          </section>
        </Grid>
      </>
    )
  }

  const extra = length > 1 && (
    <InternalLink
      icon={<BoltIcon style={{ fontSize: 18 }} />}
      to="/swap/multiple"
      disabled={isWalletEmpty}
    >
      {t("Swap multiple coins")}
    </InternalLink>
  )

  return (
    <Card {...state} title={t("Coins")} extra={extra}>
      <Grid gap={32}>{render()}</Grid>
    </Card>
  )
}

export default TerraNativeAssets
