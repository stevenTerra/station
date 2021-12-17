import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import { AccAddress } from "@terra-money/terra.js"
import { isDenomTerra } from "@terra.kitchen/utils"
import { toAmount } from "@terra.kitchen/utils"

/* helpers */
import { has } from "utils/num"
import { getAmount, sortCoins } from "utils/coin"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"

/* components */
import { Form, FormArrow, FormError } from "components/form"
import { Checkbox, RadioButton } from "components/form"
import { Read } from "components/token"

/* tx modules */
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

/* swap modules */
import AssetFormItem from "./components/AssetFormItem"
import { AssetInput, AssetReadOnly } from "./components/AssetFormItem"
import SelectToken from "./components/SelectToken"
import SlippageControl from "./components/SlippageControl"
import ExpectedPrice from "./components/ExpectedPrice"
import useSwapUtils, { calcBySlippage, validateAssets } from "./useSwapUtils"
import { SwapMode, validateParams } from "./useSwapUtils"
import { useSingleSwap } from "./SingleSwapContext"
import styles from "./SwapForm.module.scss"

interface TxValues {
  input?: number
  offerAsset?: Token
  askAsset?: Token
  mode?: SwapMode
  slippageInput?: number
}

const SwapForm = () => {
  const { t } = useTranslation()
  const address = useAddress()
  const { state } = useLocation()
  const bankBalance = useBankBalance()

  /* swap context */
  const utils = useSwapUtils()
  const { getIsSwapAvailable, getAvailableSwapModes } = utils
  const { getMsgsFunction, getSimulateQuery } = utils
  const { options, findTokenItem, findDecimals } = useSingleSwap()

  const initialOfferAsset =
    state?.offerAsset ??
    (getAmount(bankBalance, "uusd") ? "uusd" : sortCoins(bankBalance)[0].denom)
  const initialGasDenom = getInitialGasDenom(bankBalance, initialOfferAsset)

  /* options */
  const [showAll, setShowAll] = useState(false)

  const getOptions = (key: "offerAsset" | "askAsset") => {
    const { native, ibc, cw20 } = options

    const getOptionList = (list: TokenItemWithBalance[]) =>
      list.map((item) => {
        const { token: value, balance } = item

        const muted = {
          offerAsset:
            !!askAsset && !getIsSwapAvailable({ offerAsset: value, askAsset }),
          askAsset:
            !!offerAsset &&
            !getIsSwapAvailable({ offerAsset, askAsset: value }),
        }[key]

        const hidden = key === "offerAsset" && !showAll && !has(balance)
        return { ...item, value, muted, hidden }
      })

    return [
      { title: t("Native tokens"), children: getOptionList(native) },
      { title: t("IBC tokens"), children: getOptionList(ibc) },
      { title: t("Custom tokens"), children: getOptionList(cw20) },
    ]
  }

  /* form */
  const form = useForm<TxValues>({
    mode: "onChange",
    defaultValues: { offerAsset: initialOfferAsset, slippageInput: 1 },
  })

  const { register, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const values = watch()
  const { mode, input, offerAsset, askAsset, slippageInput } = values

  const offerTokenItem = offerAsset ? findTokenItem(offerAsset) : undefined
  const offerDecimals = offerAsset ? findDecimals(offerAsset) : undefined
  const askDecimals = askAsset ? findDecimals(askAsset) : undefined

  const amount = toAmount(input, { decimals: offerDecimals })

  const swapAssets = () => {
    setValue("offerAsset", askAsset)
    setValue("askAsset", offerAsset)
  }

  /* simulate | execute */
  const assets = { offerAsset, askAsset }
  const params = { amount, ...assets }
  const availableSwapModes = getAvailableSwapModes(assets)
  const isSwapAvailable = getIsSwapAvailable(assets)
  const simulateQuery = getSimulateQuery(params)

  /* simulate */
  const { data: simulationResults, isFetching } = useQuery({
    ...simulateQuery,
    onSuccess: ({ profitable }) => setValue("mode", profitable.mode),
  })

  /* Simulated value to create tx */
  // Simulated for all possible modes
  // Do not simulate again even if the mode changes
  const results = simulationResults?.values
  const result = results && mode && results[mode]

  /* Select asset */
  const onSelectAsset = (key: "offerAsset" | "askAsset") => {
    return async (value: Token) => {
      const assets = {
        offerAsset: { offerAsset: value, askAsset },
        askAsset: { offerAsset, askAsset: value },
      }[key]

      const availableSwapModes = getAvailableSwapModes(assets)

      const availableSwapMode =
        availableSwapModes?.length === 1 ? availableSwapModes[0] : undefined

      if (assets.offerAsset === assets.askAsset) {
        setValue(key === "offerAsset" ? "askAsset" : "offerAsset", undefined)
      }

      if (key === "offerAsset") {
        form.resetField("input")
        form.setFocus("input")
      }

      setValue("mode", availableSwapMode)
      setValue(key, value)
    }
  }

  /* tx */
  const getSlippageParams = useCallback(
    (values: TxValues) => {
      const { mode, input, offerAsset, askAsset, slippageInput } = values
      if (!(mode && input && offerAsset && askAsset && slippageInput)) return

      const simulated = result?.result.amount
      if (!simulated) return

      const offerDecimals = findDecimals(offerAsset)
      const askDecimals = findDecimals(askAsset)

      return {
        mode,
        input,
        offerDecimals,
        askDecimals,
        simulated,
        slippageInput,
      }
    },
    [findDecimals, result]
  )

  const balance = offerTokenItem?.balance
  const createTx = useCallback(
    (values: TxValues) => {
      const { mode, input, offerAsset, askAsset, slippageInput } = values
      if (!(mode && input && offerAsset && askAsset && slippageInput)) return

      const amount = toAmount(input, { decimals: findDecimals(offerAsset) })
      if (!balance || new BigNumber(amount).gt(balance)) return

      const params = { amount, offerAsset, askAsset }
      if (!validateParams(params)) return

      const getMsgs = getMsgsFunction(mode)
      if (!results) return { msgs: getMsgs(params) }

      /* slippage */
      const slippageParams = getSlippageParams(values)
      if (!slippageParams) throw new Error()

      const expected = calcBySlippage(slippageParams)
      return { msgs: getMsgs({ ...params, ...expected }) }
    },
    [balance, results, findDecimals, getMsgsFunction, getSlippageParams]
  )

  /* fee */
  // Fee is estimated without `belief_price` or `miminum_recevied`.
  // Otherwise, fee will be estimated whenever the input changes.
  const estimationTxValues = useMemo(() => {
    if (!result) return {}
    const { mode, query } = result
    const { offerAsset, askAsset, amount } = query

    return {
      mode,
      offerAsset,
      askAsset,
      input: toInput(amount, findDecimals(offerAsset)),
      slippageInput: 1,
    }
  }, [result, findDecimals])

  const onChangeMax = useCallback(
    (input: number) => setValue("input", input),
    [setValue]
  )

  const token = offerAsset
  const decimals = offerDecimals
  const tx = {
    token,
    decimals,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: [offerAsset, askAsset]
      .filter((asset) => asset && AccAddress.validate(asset))
      .map((token) => [
        queryKey.wasm.contractQuery,
        token,
        { balance: address },
      ]),
  }

  const disabled = isFetching ? t("Simulating...") : false

  /* render */
  const renderRadioGroup = () => {
    if (!(validateAssets(assets) && isSwapAvailable)) return null

    return (
      <section className={styles.modes}>
        {availableSwapModes.map((key) => {
          const checked = mode === key

          return (
            <RadioButton
              {...register("mode")}
              value={key}
              checked={checked}
              key={key}
            >
              {key}
            </RadioButton>
          )
        })}
      </section>
    )
  }

  /* render: simulated value */
  const simulated = result?.result.amount

  /* render: expected price */
  const slippageDisabled = [offerAsset, askAsset].every(isDenomTerra)
  const slippageParams = getSlippageParams(values)
  const expected = slippageParams && calcBySlippage(slippageParams)

  const renderExpected = () => {
    if (!(mode && validateAssets(assets))) return null
    const payload = result?.result.payload
    const props = { ...assets, ...slippageParams, ...expected, mode, payload }
    return <ExpectedPrice {...props} isLoading={isFetching} />
  }

  return (
    <Tx {...tx} disabled={disabled}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          {renderRadioGroup()}

          <AssetFormItem
            label={t("From")}
            extra={max.render((value) =>
              // Do not use automatic max here
              // Confusion arises as the amount changes and simulates again
              setValue("input", toInput(value, offerDecimals))
            )}
            error={errors.input?.message}
          >
            <SelectToken
              value={offerAsset}
              onChange={onSelectAsset("offerAsset")}
              options={getOptions("offerAsset")}
              checkbox={
                <Checkbox
                  checked={showAll}
                  onChange={() => setShowAll(!showAll)}
                >
                  {t("Show all")}
                </Checkbox>
              }
              addonAfter={
                <AssetInput
                  {...register("input", {
                    valueAsNumber: true,
                    validate: validate.input(
                      toInput(max.amount, offerDecimals)
                    ),
                  })}
                  inputMode="decimal"
                  placeholder={getPlaceholder(offerDecimals)}
                  onFocus={max.reset}
                  autoFocus
                />
              }
            />
          </AssetFormItem>

          <FormArrow onClick={swapAssets} />

          <AssetFormItem label={t("To")}>
            <SelectToken
              value={askAsset}
              onChange={onSelectAsset("askAsset")}
              options={getOptions("askAsset")}
              addonAfter={
                <AssetReadOnly>
                  {simulated ? (
                    <Read amount={simulated} decimals={askDecimals} approx />
                  ) : (
                    <p className="muted">{t("Simulating...")}</p>
                  )}
                </AssetReadOnly>
              }
            />
          </AssetFormItem>

          {!slippageDisabled && (
            <SlippageControl
              {...register("slippageInput", {
                valueAsNumber: true,
                validate: validate.input(50, 2, "Slippage tolerance"),
              })}
              input={slippageInput} // to warn
              inputMode="decimal"
              placeholder={getPlaceholder(2)}
              error={errors.slippageInput?.message}
            />
          )}

          {renderExpected()}
          {fee.render()}

          {validateAssets(assets) && !isSwapAvailable && (
            <FormError>{t("Pair does not exist")}</FormError>
          )}

          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default SwapForm
