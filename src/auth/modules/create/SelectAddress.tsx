import { useTranslation } from "react-i18next"
import { useQuery } from "react-query"
import { useForm } from "react-hook-form"
import classNames from "classnames/bind"
import { MnemonicKey, AccAddress } from "@terra-money/terra.js"
import { Coins, Delegation, UnbondingDelegation } from "@terra-money/terra.js"
import { sortCoins } from "utils/coin"
import { useLCDClient } from "data/Terra/lcdClient"
import { useCurrency } from "data/settings/Currency"
import { useThemeAnimation } from "data/settings/Theme"
import { Flex, Grid } from "components/layout"
import { Form, Submit } from "components/form"
import { Read } from "components/token"
import { Tag } from "components/display"
import { useCreateWallet } from "./CreateWalletWizard"
import styles from "./SelectAddress.module.scss"

const cx = classNames.bind(styles)

const SelectAddress = () => {
  const { t } = useTranslation()
  const currency = useCurrency()
  const lcd = useLCDClient()
  const { values, createUser } = useCreateWallet()
  const { mnemonic } = values

  /* query */
  const { data: results } = useQuery(
    ["mnemonic", mnemonic],
    async () => {
      const results = await Promise.allSettled(
        ([118, 330] as const).map(async (coinType) => {
          const mk = new MnemonicKey({ mnemonic, coinType })
          const address = mk.accAddress
          const [balance] = await lcd.bank.balance(address)
          const [delegations] = await lcd.staking.delegations(address)
          const [unbondings] = await lcd.staking.unbondingDelegations(address)
          return { address, bip: coinType, balance, delegations, unbondings }
        })
      )

      return results.map((result) => {
        if (result.status === "rejected") throw new Error()
        return result.value
      })
    },
    {
      onSuccess: (results) => {
        const account118 = results.find(({ bip }) => bip === 118)
        if (!account118) return
        const { balance, delegations, unbondings } = account118
        const is118Empty =
          !balance.toData().length && !delegations.length && !unbondings.length
        if (is118Empty) createUser(330)
      },
    }
  )

  /* form */
  const form = useForm<{ bip?: Bip }>()
  const { watch, setValue, handleSubmit } = form
  const { bip } = watch()

  const submit = ({ bip }: { bip?: Bip }) => {
    if (!bip) return
    createUser(bip)
  }

  /* render */
  const animation = useThemeAnimation()

  if (!results)
    return (
      <Flex>
        <img src={animation} width={80} height={80} alt={t("Loading...")} />
      </Flex>
    )

  interface Details {
    address: AccAddress
    bip: Bip
    balance: Coins
    delegations: Delegation[]
    unbondings: UnbondingDelegation[]
  }

  const renderDetails = ({ address, bip, ...rest }: Details) => {
    const { balance, delegations, unbondings } = rest
    const coins = sortCoins(balance, currency)
    const length = coins.length

    return (
      <Grid gap={4}>
        <Flex gap={4} start>
          <Tag color="info">{bip}</Tag>
          {!!delegations.length && <Tag color="info">{t("Delegated")}</Tag>}
          {!!unbondings.length && <Tag color="info">{t("Unbondings")}</Tag>}
        </Flex>

        <h1>{address}</h1>

        <Flex gap={4} start>
          {coins.slice(0, 3).map((coin) => (
            <Read {...coin} key={coin.denom} />
          ))}

          {length - 3 > 0 && (
            <span className="muted">
              {t("+{{length}} coins", { length: length - 3 })}
            </span>
          )}
        </Flex>
      </Grid>
    )
  }

  return (
    <Grid gap={20}>
      <Form onSubmit={handleSubmit(submit)}>
        {results.map((item) => {
          const active = item.bip === bip
          const muted = bip && !active

          return (
            <button
              type="button"
              className={cx(styles.button, { active, muted })}
              onClick={() => setValue("bip", item.bip)}
              key={item.bip}
            >
              {renderDetails(item)}
            </button>
          )
        })}

        <Submit />
      </Form>
    </Grid>
  )
}

export default SelectAddress
