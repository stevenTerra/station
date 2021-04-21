import TxVolume from "../charts/TxVolume"
import StakingReturn from "../charts/StakingReturn"
import TaxRewards from "../charts/TaxRewards"
import Accounts from "../charts/Accounts"
import styles from "./Charts.module.scss"

const Charts = () => {
  return (
    <div className={styles.charts}>
      <TxVolume />
      <StakingReturn />
      <TaxRewards />
      <Accounts />
    </div>
  )
}

export default Charts
