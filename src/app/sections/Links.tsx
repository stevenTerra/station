import { useTranslation } from "react-i18next"
import DescriptionIcon from "@mui/icons-material/Description"
import { TUTORIAL } from "config/constants"
import { ReactComponent as Medium } from "styles/images/community/Medium.svg"
import { ReactComponent as Discord } from "styles/images/community/Discord.svg"
import { ReactComponent as Telegram } from "styles/images/community/Telegram.svg"
import { ReactComponent as Twitter } from "styles/images/community/Twitter.svg"
import { ReactComponent as Github } from "styles/images/community/Github.svg"
import { ExternalLink } from "components/general"
import { Flex } from "components/layout"
import styles from "./Links.module.scss"

const ICON_SIZE = { width: 18, height: 18 }
const community = [
  { href: "https://medium.com/terra-money", icon: <Medium {...ICON_SIZE} /> },
  { href: "https://discord.gg/8uGSUQN7wV", icon: <Discord {...ICON_SIZE} /> },
  { href: "https://t.me/TerraLunaChat", icon: <Telegram {...ICON_SIZE} /> },
  { href: "https://twitter.com/terra_money", icon: <Twitter {...ICON_SIZE} /> },
  { href: "https://github.com/terra-money", icon: <Github {...ICON_SIZE} /> },
]

const Links = () => {
  const { t } = useTranslation()

  return (
    <div>
      <div className={styles.tutorial}>
        <ExternalLink href={TUTORIAL} className={styles.link}>
          <DescriptionIcon style={{ fontSize: 18 }} />
          {t("Tutorial")}
        </ExternalLink>
      </div>

      <div className={styles.community}>
        <Flex start className={styles.wrapper}>
          {community.map(({ href, icon }) => (
            <ExternalLink href={href} className={styles.icon} key={href}>
              {icon}
            </ExternalLink>
          ))}
        </Flex>
      </div>
    </div>
  )
}

export default Links
