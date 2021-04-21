import { useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { AccAddress } from "@terra-money/terra.js"
import { MsgExecuteContract, MsgSend } from "@terra-money/terra.js"
import { isDenom, toAmount } from "@terra.kitchen/utils"
import { SAMPLE_ADDRESS } from "config/constants"
import { queryKey } from "data/query"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { ExternalLink } from "components/general"
import { Auto, Card, Grid } from "components/layout"
import { Form, FormItem, FormHelp, Input, FormWarning } from "components/form"
import AddressBookList from "../AddressBook/AddressBookList"
import { getPlaceholder, toInput } from "../utils"
import validate from "../validate"
import Tx, { getInitialGasDenom } from "../Tx"

interface TxValues {
  recipient?: AccAddress
  input?: number
  memo?: string
}

interface Props extends TokenItem {
  decimals: number
  balance: Amount
}

const SendForm = ({ token, decimals, balance }: Props) => {
  const { t } = useTranslation()
  const address = useAddress()
  const bankBalance = useBankBalance()

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance, token)

  /* form */
  const form = useForm<TxValues>({ mode: "onChange" })
  const { register, watch, setValue, handleSubmit, formState } = form
  const { errors } = formState
  const { input, memo } = watch()
  const amount = toAmount(input, { decimals })

  const onClickAddressBookItem = ({ recipient, memo }: AddressBook) => {
    setValue("recipient", recipient)
    setValue("memo", memo)
  }

  /* tx */
  const createTx = useCallback(
    ({ recipient, input, memo }: TxValues) => {
      if (!address || !recipient) return
      const amount = toAmount(input, { decimals })
      const execute_msg = { transfer: { recipient, amount } }

      const msgs = isDenom(token)
        ? [new MsgSend(address, recipient, amount + token)]
        : [new MsgExecuteContract(address, token, execute_msg)]

      return { msgs, memo }
    },
    [address, decimals, token]
  )

  /* fee */
  const estimationTxValues = useMemo(
    () => ({ recipient: address, input: toInput(1, decimals) }),
    [address, decimals]
  )

  const onChangeMax = useCallback(
    (input: number) => setValue("input", input),
    [setValue]
  )

  const tx = {
    token,
    decimals,
    amount,
    balance,
    initialGasDenom,
    estimationTxValues,
    createTx,
    onChangeMax,
    queryKeys: AccAddress.validate(token)
      ? [[queryKey.wasm.contractQuery, token, { balance: address }]]
      : undefined,
  }

  const bridge = (
    <ExternalLink href="https://bridge.terra.money">Terra Bridge</ExternalLink>
  )

  return (
    <Auto
      columns={[
        <Card>
          <Tx {...tx}>
            {({ max, fee, submit }) => (
              <Form onSubmit={handleSubmit(submit.fn)}>
                <Grid gap={4}>
                  <FormHelp>Use {bridge} for interchain transfers</FormHelp>
                  {!memo && (
                    <FormWarning>
                      {t("Double check if the transaction requires a memo")}
                    </FormWarning>
                  )}
                </Grid>

                <FormItem label={t("To")} error={errors.recipient?.message}>
                  <Input
                    {...register("recipient", {
                      validate: validate.address(),
                    })}
                    placeholder={SAMPLE_ADDRESS}
                    autoFocus
                  />
                </FormItem>

                <FormItem
                  label={t("Amount")}
                  extra={max.render()}
                  error={errors.input?.message}
                >
                  <Input
                    {...register("input", {
                      valueAsNumber: true,
                      validate: validate.input(
                        toInput(max.amount, decimals),
                        decimals
                      ),
                    })}
                    token={token}
                    inputMode="decimal"
                    onFocus={max.reset}
                    placeholder={getPlaceholder(decimals)}
                  />
                </FormItem>

                <FormItem
                  label={`${t("Memo")} (${t("Optional")})`}
                  error={errors.memo?.message}
                >
                  <Input
                    {...register("memo", {
                      validate: {
                        size: validate.size(256, "Memo"),
                        brackets: validate.memo(),
                      },
                    })}
                    placeholder={t("Memo required by the exchanges")}
                  />
                </FormItem>

                {fee.render()}
                {submit.button}
              </Form>
            )}
          </Tx>
        </Card>,
        <AddressBookList onClick={onClickAddressBookItem} />,
      ]}
    />
  )
}

export default SendForm
