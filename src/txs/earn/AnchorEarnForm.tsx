import { useTranslation } from "react-i18next"
import { useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"
import { toAmount } from "@terra.kitchen/utils"
import { getAmount } from "utils/coin"
import { queryKey } from "data/query"
import { useBankBalance } from "data/queries/bank"
import { useAnchorGetMsgs } from "data/earn/anchor"
import { Form, FormItem, Input } from "components/form"
import { toInput, getPlaceholder } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface Props {
  tab: AnchorEarnAction
  deposit: string
  rate: string
}

interface TxValues {
  input?: number
}

export enum AnchorEarnAction {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

const AnchorEarnForm = ({ tab, deposit, rate }: Props) => {
  const { t } = useTranslation()
  const bankBalance = useBankBalance()

  /* tx context */
  const token = tab === AnchorEarnAction.DEPOSIT ? "uusd" : ""
  const initialGasDenom = getInitialGasDenom(bankBalance, token)

  /* context */
  const getMsgs = useAnchorGetMsgs(rate)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input } = watch()
  const amount = toAmount(input)

  /* tx */
  const createTx = useCallback(
    ({ input }: TxValues) => {
      const amount = toAmount(input)
      return { msgs: getMsgs(amount, tab) ?? [] }
    },
    [getMsgs, tab]
  )

  /* fee */
  const estimationTxValues = useMemo(
    // Anchor deposit throw if amount is too small
    () => ({ input: toInput(1e6) }),
    []
  )

  const onChangeMax = useCallback(
    (input: number) => setValue("input", input),
    [setValue]
  )

  const tx = {
    token,
    amount,
    balance:
      tab === AnchorEarnAction.WITHDRAW
        ? deposit
        : getAmount(bankBalance, token),
    initialGasDenom,
    estimationTxValues,
    createTx,
    gasAdjustment: 2,
    onChangeMax,
    queryKeys: [queryKey.Anchor.TotalDeposit],
  }

  return (
    <Tx {...tx}>
      {({ max, fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <FormItem
            label={t("Amount")}
            extra={max.render()}
            error={errors.input?.message}
          >
            <Input
              {...register("input", {
                valueAsNumber: true,
                validate: validate.input(toInput(max.amount)),
              })}
              token="uusd"
              onFocus={max.reset}
              inputMode="decimal"
              placeholder={getPlaceholder()}
              autoFocus
            />
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default AnchorEarnForm
