import { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import BigNumber from "bignumber.js"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { Validator, ValAddress } from "@terra-money/terra.js"
import { Coins, Rewards } from "@terra-money/terra.js"
import { MsgWithdrawDelegatorReward } from "@terra-money/terra.js"
import { useCurrency } from "data/settings/Currency"
import { useAddress } from "data/wallet"
import { useBankBalance } from "data/queries/bank"
import { useMemoizedCalcValue } from "data/queries/oracle"
import { getFindMoniker } from "data/queries/staking"
import { calcRewardsValues } from "data/queries/distribution"
import { WithTokenItem } from "data/token"
import { ValidatorLink } from "components/general"
import { Form, FormArrow, FormItem, Checkbox } from "components/form"
import { Card, Flex } from "components/layout"
import { Read, TokenCard, TokenCardGrid } from "components/token"
import Tx, { getInitialGasDenom } from "../Tx"
import styles from "./WithdrawRewardsForm.module.scss"

interface Props {
  rewards: Rewards
  validators: Validator[]
  exchangeRates: Coins
}

const WithdrawRewardsForm = ({ rewards, validators, exchangeRates }: Props) => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const address = useAddress()
  const bankBalance = useBankBalance()
  const calcValue = useMemoizedCalcValue()
  const findMoniker = getFindMoniker(validators)
  const { byValidator } = calcRewardsValues(rewards, currency, calcValue)

  /* tx context */
  const initialGasDenom = getInitialGasDenom(bankBalance)

  /* select validators */
  const init = (value = false) =>
    byValidator.reduce((acc, { address }) => ({ ...acc, [address]: value }), {})

  const [state, setState] = useState<Record<ValAddress, boolean>>(init(true))
  const selectable = byValidator.length > 1
  const selected = useMemo(
    () => Object.keys(state).filter((address) => state[address]),
    [state]
  )

  const [isOpen, setIsOpen] = useState(true)
  const toggle = () => setIsOpen(!isOpen)

  /* calc */
  const selectedTotal = selected.reduce<Record<Denom, Amount>>(
    (prev, address) => {
      const item = byValidator.find((item) => item.address === address)

      if (!item) throw new Error()

      return {
        ...prev,
        ...item.list.reduce(
          (acc, { amount, denom }) => ({
            ...acc,
            [denom]: new BigNumber(amount).plus(prev[denom] ?? 0).toString(),
          }),
          {}
        ),
      }
    },
    {}
  )

  const selectedValidatorsText = !selected.length
    ? t("Not selected")
    : selected.length === 1
    ? findMoniker(selected[0])
    : t("{{moniker}} and {{length}} others", {
        moniker: findMoniker(selected[0]),
        length: selected.length - 1,
      })

  /* form */
  const { handleSubmit } = useForm({ mode: "onChange" })

  /* tx */
  const createTx = useCallback(() => {
    if (!address) return

    const msgs = selected.map((operatorAddress) => {
      return new MsgWithdrawDelegatorReward(address, operatorAddress)
    })

    return { msgs }
  }, [address, selected])

  /* fee */
  const estimationTxValues = useMemo(() => ({}), [])

  const tx = {
    initialGasDenom,
    estimationTxValues,
    createTx,
  }

  return (
    <Tx {...tx}>
      {({ fee, submit }) => (
        <Form onSubmit={handleSubmit(submit.fn)}>
          <dl>
            <dt>{t("Validators")}</dt>
            <dd>
              {selectable ? (
                <button type="button" onClick={toggle}>
                  {selectedValidatorsText}
                  {isOpen ? (
                    <ExpandLessIcon style={{ fontSize: 16 }} />
                  ) : (
                    <ExpandMoreIcon style={{ fontSize: 16 }} />
                  )}
                </button>
              ) : (
                selectedValidatorsText
              )}
            </dd>
          </dl>

          {selectable && isOpen && (
            <Card size="small" className={styles.card}>
              <Flex className={styles.actions}>
                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(init(true))}
                >
                  {t("Select all")}
                </button>

                <button
                  type="button"
                  className={styles.button}
                  onClick={() => setState(init(false))}
                >
                  {t("Deselect all")}
                </button>
              </Flex>

              <section className={styles.validators}>
                {byValidator.map(({ address, sum }) => {
                  const checked = state[address]

                  return (
                    <Checkbox
                      className={styles.checkbox}
                      checked={checked}
                      onChange={() =>
                        setState({ ...state, [address]: !checked })
                      }
                      key={address}
                    >
                      <div className={styles.item}>
                        <ValidatorLink address={address} />
                        <Read amount={sum} token={currency} approx />
                      </div>
                    </Checkbox>
                  )
                })}
              </section>
            </Card>
          )}

          <FormArrow />

          <FormItem>
            <TokenCardGrid maxHeight>
              {Object.entries(selectedTotal).map(([denom, amount]) => (
                <WithTokenItem token={denom} key={denom}>
                  {(item) => (
                    <TokenCard
                      {...item}
                      value={calcValue({ amount, denom })}
                      amount={amount}
                    />
                  )}
                </WithTokenItem>
              ))}
            </TokenCardGrid>
          </FormItem>

          {fee.render()}
          {submit.button}
        </Form>
      )}
    </Tx>
  )
}

export default WithdrawRewardsForm
