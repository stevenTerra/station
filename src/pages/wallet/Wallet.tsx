import { Auto, Page } from "components/layout"
import TerraNativeAssets from "./TerraNativeAssets"
import IBCAssets from "./IBCAssets"
import CW20Assets from "./CW20Assets"
import Rewards from "./Rewards"
import AnchorEarn from "./AnchorEarn"

const Wallet = () => {
  return (
    <Page title="Wallet">
      <Auto
        columns={[
          <>
            <TerraNativeAssets />
            <IBCAssets />
            <CW20Assets />
          </>,
          <>
            <Rewards />
            <AnchorEarn />
          </>,
        ]}
      />
    </Page>
  )
}

export default Wallet
