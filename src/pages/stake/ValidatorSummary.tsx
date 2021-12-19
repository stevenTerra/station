import { useTranslation } from "react-i18next"
import { readPercent } from "@terra.kitchen/utils"
import { AccAddress, Validator } from "@terra-money/terra.js"
import { Content } from "types/components"
import { FinderLink } from "components/general"
import { Card, Grid } from "components/layout"
import { ToNow } from "components/display"
import styles from "./ValidatorSummary.module.scss"

const ValidatorSummary = ({ validator }: { validator: Validator }) => {
  const { t } = useTranslation()

  const { operator_address, commission } = validator
  const { commission_rates, update_time } = commission
  const { max_change_rate, max_rate, rate } = commission_rates

  const numbers = [
    {
      title: t("Commission"),
      content: readPercent(rate.toString()),
    },
    {
      title: t("Last commission change"),
      content: <ToNow>{update_time}</ToNow>,
    },
    {
      title: t("Max commission rate"),
      content: readPercent(max_rate.toString()),
    },
    {
      title: t("Max daily commission change"),
      content: readPercent(max_change_rate.toString()),
    },
  ]

  const addresses = [
    {
      title: t("Operator address"),
      content: <FinderLink validator>{operator_address}</FinderLink>,
    },
    {
      title: t("Wallet address"),
      content: (
        <FinderLink>{AccAddress.fromValAddress(operator_address)}</FinderLink>
      ),
    },
  ]

  const render = ({ title, content }: Content) => {
    return (
      <Grid className={styles.item} key={title}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.value}>{content}</p>
      </Grid>
    )
  }

  return (
    <Card>
      <Grid className={styles.numbers}>{numbers.map(render)}</Grid>
      <Grid gap={12} className={styles.addresses}>
        {addresses.map(render)}
      </Grid>
    </Card>
  )
}

export default ValidatorSummary
