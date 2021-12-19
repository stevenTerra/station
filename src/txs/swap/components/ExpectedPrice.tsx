import { useTranslation } from "react-i18next"
import { isDenomLuna, isDenomTerra } from "@terra.kitchen/utils"
import { readDenom, readPercent } from "@terra.kitchen/utils"
import { toPrice } from "utils/num"
import { useMarketParams } from "data/queries/market"
import { useOracleParams } from "data/queries/oracle"
import { Read } from "components/token"
import { TooltipIcon } from "components/display"
import { PayloadOnchain, PayloadTerraswap } from "../useSwapUtils"
import { PayloadRouteswap } from "../useSwapUtils"
import { SwapAssets, SwapMode, SwapSpread } from "../useSwapUtils"
import { SlippageParams } from "../useSwapUtils"
import { useSingleSwap } from "../SingleSwapContext"
import Price from "./Price"

interface Props
  extends SwapAssets,
    Partial<SlippageParams>,
    Partial<SwapSpread> {
  isLoading: boolean
  payload?: PayloadOnchain | PayloadTerraswap | PayloadRouteswap
}

const ExpectedPrice = ({ mode, input, ...props }: Props) => {
  const { offerAsset, askAsset, askDecimals } = props
  const { price, minimum_receive, payload, isLoading } = props
  const { t } = useTranslation()
  const { findDecimals } = useSingleSwap()

  /* query: native */
  const minSpread = useSwapSpread()
  const tobinTax = useTobinTax(askAsset)

  /* render: expected price */
  const renderPrice = (price?: Price) => <Price {...props} price={price} />

  const renderExpectedPrice = () => {
    return (
      <>
        <dt>{t("Expected price")}</dt>
        <dd>{!isLoading && renderPrice(price)}</dd>
      </>
    )
  }

  /* render: by mode */
  const renderOnchain = () => {
    const rate = (payload as PayloadOnchain)?.rate
    const spread = (payload as PayloadOnchain)?.spread

    const tooltip = (
      <>
        {[offerAsset, askAsset].some(isDenomLuna) && (
          <p>
            {t("Luna swap spread: minimum {{minSpread}}", {
              minSpread: readPercent(minSpread),
            })}
          </p>
        )}

        {askAsset && isDenomTerra(askAsset) && tobinTax && (
          <p>
            {t("{{symbol}} tobin tax: {{tobinTax}}", {
              symbol: readDenom(askAsset),
              tobinTax: readPercent(tobinTax),
            })}
          </p>
        )}
      </>
    )

    return (
      <>
        <dt>{t("Oracle price")}</dt>
        <dd>{renderPrice(rate)}</dd>
        {renderExpectedPrice()}
        <dt>
          <TooltipIcon content={tooltip}>{t("Spread")}</TooltipIcon>
        </dt>
        <dd>
          {!isLoading && (
            <Read amount={spread} denom={askAsset} decimals={askDecimals} />
          )}
        </dd>
      </>
    )
  }

  const renderTerraswap = () => {
    const rate = (payload as PayloadTerraswap)?.rate
    const fee = (payload as PayloadTerraswap)?.fee

    const offerDecimals = findDecimals(offerAsset)
    const askDecimals = findDecimals(askAsset)
    const decimals = offerDecimals - askDecimals
    const price = toPrice(Number(rate) * Math.pow(10, decimals))

    return (
      <>
        <dt>{t("Pair price")}</dt>
        <dd>{renderPrice(price)}</dd>
        {renderExpectedPrice()}
        <dt>{t("Trading fee")}</dt>
        <dd>
          {!isLoading && (
            <Read amount={fee} denom={askAsset} decimals={askDecimals} />
          )}
        </dd>
      </>
    )
  }

  const renderRouteswap = () => {
    return <>{renderExpectedPrice()}</>
  }

  const renderByMode = (mode: SwapMode) =>
    ({
      [SwapMode.ONCHAIN]: renderOnchain,
      [SwapMode.TERRASWAP]: renderTerraswap,
      [SwapMode.ROUTESWAP]: renderRouteswap,
    }[mode]())

  /* render: minimum received */
  const renderMinimumReceived = () => {
    return (
      <>
        <dt>{t("Minimum received")}</dt>
        <dd>
          {!isLoading && (
            <Read
              amount={minimum_receive}
              token={askAsset}
              decimals={findDecimals(askAsset)}
            />
          )}
        </dd>
      </>
    )
  }

  return (
    <dl>
      {mode && renderByMode(mode)}
      {renderMinimumReceived()}
    </dl>
  )
}

export default ExpectedPrice

/* hooks */
const useSwapSpread = () => {
  const { data: marketParams } = useMarketParams()
  const minSpread = marketParams?.min_stability_spread
  return minSpread?.toString()
}

const useTobinTax = (askAsset?: CoinDenom) => {
  const { data: oracleParams } = useOracleParams()
  const tobinTax = oracleParams?.whitelist.find(
    ({ name }) => name === askAsset
  )?.tobin_tax

  return tobinTax?.toString()
}
