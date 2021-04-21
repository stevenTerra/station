import { ValAddress } from "@terra-money/terra.js"
import { getFindMoniker, useValidators } from "data/queries/staking"
import { FinderLink } from "../general"

interface Props {
  address: ValAddress
}

const ValidatorLink = ({ address }: Props) => {
  const { data: validators } = useValidators()

  const render = () => {
    if (!validators) return null
    const moniker = getFindMoniker(validators)(address)
    return (
      <FinderLink value={address} validator>
        {moniker}
      </FinderLink>
    )
  }

  return render()
}

export default ValidatorLink
