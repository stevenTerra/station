import { useTranslation } from "react-i18next"
import LaptopOutlinedIcon from "@mui/icons-material/LaptopOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import { STAKE_ID, TERRA_VALIDATORS } from "config/constants"
import { useTerraValidator } from "data/Terra/TerraAPI"
import { ReactComponent as TerraValidatorProfiles } from "styles/images/stake/TerraValidatorProfiles.svg"
import { ReactComponent as StakeID } from "styles/images/stake/StakeID.svg"
import { ExternalLink, validateLink } from "components/general"
import { Card, Flex, Grid } from "components/layout"
import ProfileIcon from "./components/ProfileIcon"
import { ValidatorJailed, ValidatorStatus } from "./components/ValidatorTag"
import useAddressParams from "./useAddressParams"
import styles from "./ValidatorCompact.module.scss"

const ValidatorCompact = () => {
  const { t } = useTranslation()
  const address = useAddressParams()
  const { data: validator, ...state } = useTerraValidator(address)

  if (!validator) return null

  const { operator_address } = validator
  const { status, jailed, description } = validator
  const { moniker, details, website } = description
  const { picture, contact } = validator
  const email = contact?.email

  return (
    <Card {...state}>
      <Grid gap={16}>
        <Flex gap={16} className={styles.contact} start>
          <ProfileIcon src={picture} size={60} />

          <Grid gap={4}>
            <Flex gap={10} start>
              <h1 className={styles.moniker}>{moniker}</h1>
              <ValidatorStatus status={status} />
              {jailed && <ValidatorJailed />}
            </Flex>

            {validateLink(website) && (
              <Flex gap={4} className={styles.link} start>
                <LaptopOutlinedIcon fontSize="inherit" />
                <ExternalLink href={website}>{website}</ExternalLink>
              </Flex>
            )}

            {email && (
              <Flex gap={4} className={styles.link} start>
                <EmailOutlinedIcon fontSize="inherit" />
                <ExternalLink href={`mailto:${email}`}>{email}</ExternalLink>
              </Flex>
            )}
          </Grid>
        </Flex>

        {details && <p>{details}</p>}

        <Grid gap={4} className={styles.footer}>
          <h2>{t("View on")}</h2>

          <Flex start gap={8} className={styles.links}>
            <ExternalLink href={TERRA_VALIDATORS + operator_address}>
              <TerraValidatorProfiles height={36} />
            </ExternalLink>

            <ExternalLink href={STAKE_ID + operator_address}>
              <StakeID height={36} />
            </ExternalLink>
          </Flex>
        </Grid>
      </Grid>
    </Card>
  )
}

export default ValidatorCompact
