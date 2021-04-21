import { useCallback, useMemo } from "react"
import { useQuery } from "react-query"
import BigNumber from "bignumber.js"
import { Validator } from "@terra-money/terra.js"
import { queryKey, RefetchOptions } from "../query"
import { useLCDClient } from "../Terra/lcdClient"

export const useValidatorSet = () => {
  const lcd = useLCDClient()

  return useQuery(
    [queryKey.tendermint.validatorSet],
    async () => {
      const [set0] = await lcd.tendermint.validatorSet()
      const [set1] = await lcd.tendermint.validatorSet(undefined, {
        "pagination.offset": 100,
      })

      return [...set0, ...set1]
    },
    { ...RefetchOptions.INFINITY }
  )
}

/* helpers */
export const useCalcVotingPower = () => {
  const { data: validatorSet } = useValidatorSet()

  const total = useMemo(() => {
    if (!validatorSet) return

    return BigNumber.sum(
      ...validatorSet.map(({ voting_power }) => voting_power)
    ).toString()
  }, [validatorSet])

  return useCallback(
    ({ consensus_pubkey }: Validator) => {
      if (!(validatorSet && total)) return

      const validator = validatorSet.find(
        (validator) => validator.pub_key.key === consensus_pubkey.key
      )

      if (!validator) return 0

      const { voting_power } = validator

      return new BigNumber(voting_power).div(total).dp(5).toNumber()
    },
    [validatorSet, total]
  )
}
