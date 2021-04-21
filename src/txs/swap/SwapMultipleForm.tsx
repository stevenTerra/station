import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { flatten, fromPairs } from "ramda"
import { Coin, Coins } from "@terra-money/terra.js"

/* helpers */
import { has } from "utils/num"
import { sortDenoms } from "utils/coin"
import { useCurrency } from "data/settings/Currency"
import { readNativeDenom, WithTokenItem } from "data/token"
import { useMemoizedCalcValue, useMemoizedPrices } from "data/queries/oracle"

/* components */
import { Form, FormArrow, Checkbox } from "components/form"
import { Table } from "components/layout"
import { Read, Token } from "components/token"

/* tx modules */
import Tx, { calcMax } from "../Tx"

/* swap modules */
import AssetFormItem, { AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import Price from "./components/Price"
import useSwapUtils from "./useSwapUtils"
import { useSwap } from "./SwapContext"
import { useMultipleSwap } from "./MultipleSwapContext"
import styles from "./SwapMultipleForm.module.scss"

interface TxValues {
  askAsset: NativeDenom
}

// available > simulatable > simulated > selectable > offers
// available: all assets
// simulatable: non-askAsset, balance exists except tax.
// selectable: simulated result value exists
// offers: selected by the user
const SwapMultipleForm = () => {
  const { t } = useTranslation()
  const currency = useCurrency()

  /* swap context */
  const utils = useSwapUtils()
  const { getSwapMode, getSimulateFunction, getMsgsFunction } = utils
  const { activeDenoms } = useSwap()
  const { taxRate, taxCaps, available } = useMultipleSwap()
  const initialGasDenom = "uluna"

  /* options: askAsset */
  const options = [
    {
      title: t("Native tokens"),
      children: sortDenoms(activeDenoms, currency).map((denom) => {
        return { ...readNativeDenom(denom), value: denom }
      }),
    },
  ]

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { askAsset: "uluna" },
  })

  const { watch, setValue, handleSubmit } = form
  const { askAsset } = watch()

  const simulatable = available
    .map((item) => {
      const { token, balance } = item
      const cap = taxCaps[token]
      const max = calcMax({ balance, rate: taxRate, cap, gasAmount: "0" })
      return { ...item, ...max }
    })
    .filter(({ token, max }) => token !== askAsset && has(max))

  /* simulate */
  const { data: simulated = [], isFetching: isSimulating } = useQuery(
    ["simulate.swap.multiple", simulatable, askAsset],
    async () => {
      const simulated = await Promise.allSettled(
        simulatable.map(async ({ token: offerAsset, max: amount, tax }) => {
          const mode = getSwapMode({ offerAsset, askAsset })

          try {
            const params = { amount, offerAsset, askAsset }
            const { result } = await getSimulateFunction(mode)(params)
            return { offerAsset, mode, amount, tax, value: result.amount }
          } catch (error) {
            // errors because too small amount is simulated
            return { offerAsset, mode, amount, tax, value: "0" }
          }
        })
      )

      return simulated.map((result) => {
        if (result.status === "rejected") throw new Error(result.reason)
        return result.value
      })
    }
  )

  /* select denoms */
  const selectable = useMemo(
    () => simulated.filter(({ value }) => has(value)),
    [simulated]
  )

  const init = useMemo(
    () => fromPairs(selectable.map(({ offerAsset }) => [offerAsset, true])),
    [selectable]
  )

  const [state, setState] = useState<Record<NativeDenom, boolean>>(init)

  useEffect(() => {
    setState(init)
  }, [init, selectable, setValue])

  /* tx */
  const offers = selectable.filter(({ offerAsset }) => state[offerAsset])
  const createTx = useCallback(
    ({ askAsset }: TxValues) => {
      if (isSimulating || !offers.length) return

      const msgs = flatten(
        offers.map((params) => {
          const getMsgs = getMsgsFunction(params.mode)
          return getMsgs({ ...params, askAsset })
        })
      )

      return { msgs }
    },
    [offers, isSimulating, getMsgsFunction]
  )

  /* fee */
  const estimationTxValues = useMemo(() => ({ askAsset }), [askAsset])

  const taxes = new Coins(
    offers
      .filter(({ tax }) => tax)
      .map(({ offerAsset, tax }) => {
        if (!tax) throw new Error()
        return new Coin(offerAsset, tax)
      })
  )

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
    taxes,
    availableGasDenoms: [askAsset],
  }

  const disabled = isSimulating ? t("Simulating...") : false

  /* render */
  const { data: prices } = useMemoizedPrices(askAsset)
  const calcValue = useMemoizedCalcValue(askAsset)
  const renderTable = () => {
    if (isSimulating || !(selectable && prices && calcValue)) return []

    const dataSource = selectable.map((item) => {
      const { offerAsset, amount, value: expectedValue } = item

      /* oracle */
      const oracleValue = calcValue({ amount, denom: offerAsset })
      const oraclePrice = prices?.[offerAsset]
      const oracle = { value: oracleValue, price: oraclePrice }

      /* expected */
      const expectedPrice = Number(expectedValue) / Number(amount)
      const expected = { value: expectedValue, price: expectedPrice }

      return { ...item, oracle, expected }
    })

    return (
      <Table
        columns={[
          {
            dataIndex: "offerAsset",
            key: "checkbox",
            render: (offerAsset) => {
              const checked = state[offerAsset]
              return (
                <Checkbox
                  defaultChecked={checked}
                  onChange={() =>
                    setState({ ...state, [offerAsset]: !checked })
                  }
                  key={offerAsset}
                />
              )
            },
          },
          {
            dataIndex: "offerAsset",
            render: (offerAsset) => (
              <WithTokenItem token={offerAsset}>
                {(item) => <Token {...item} name="" />}
              </WithTokenItem>
            ),
          },
          {
            title: "Balance",
            dataIndex: "amount",
            render: (amount) => <Read amount={amount} />,
            align: "right",
          },
          {
            title: "Value",
            dataIndex: "oracle",
            render: (oracle, { offerAsset }) => {
              return (
                <>
                  <Read
                    amount={oracle.value}
                    denom={askAsset}
                    auto
                    approx
                    block
                  />
                  <Price
                    price={oracle.price}
                    offerAsset={offerAsset}
                    askAsset={askAsset}
                    className={styles.price}
                  />
                </>
              )
            },
            align: "right",
          },
          {
            title: "Expected",
            dataIndex: "expected",
            render: (expected, { offerAsset }) => {
              if (!expected) return null
              return (
                <>
                  <Read amount={expected.value} denom={askAsset} approx block />
                  <Price
                    price={expected.price}
                    offerAsset={offerAsset}
                    askAsset={askAsset}
                    className={styles.price}
                  />
                </>
              )
            },
            align: "right",
          },
        ]}
        dataSource={dataSource}
        size="small"
      />
    )
  }

  const expectedTotal = useMemo(() => {
    if (isSimulating) return
    return BigNumber.sum(...offers.map(({ value }) => value)).toString()
  }, [isSimulating, offers])

  return (
    <Tx {...tx} disabled={disabled}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {renderTable()}

          {!!selectable.length && (
            <>
              <FormArrow />

              <AssetFormItem label={t("To")}>
                <SelectToken
                  value={askAsset}
                  onChange={(value) => setValue("askAsset", value)}
                  options={options}
                  addonAfter={
                    <AssetReadOnly>
                      <Read amount={expectedTotal} />
                    </AssetReadOnly>
                  }
                />
              </AssetFormItem>
            </>
          )}

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default SwapMultipleForm
