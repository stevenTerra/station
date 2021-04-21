import { useTranslation } from "react-i18next"
import { isDenomIBC } from "@terra.kitchen/utils"
import { sortCoins } from "utils/coin"
import { useBankBalance } from "data/queries/bank"
import { WithTokenItem } from "data/token"
import { Card } from "components/layout"
import Asset from "./Asset"

const IBCAssets = () => {
  const { t } = useTranslation()
  const bankBalance = useBankBalance()

  const list = sortCoins(bankBalance).filter(({ denom }) => isDenomIBC(denom))

  return !list.length ? null : (
    <Card title={t("IBC tokens")}>
      {list.map(({ amount, denom }) => {
        return (
          <WithTokenItem token={denom} key={denom}>
            {(item) => <Asset {...item} balance={amount} key={denom} />}
          </WithTokenItem>
        )
      })}
    </Card>
  )
}

export default IBCAssets
