import { FC, ReactNode } from "react"
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"
import ERROR from "config/ERROR"
import State from "./State"

const Empty: FC<{ icon?: ReactNode }> = ({ icon, children }) => {
  return (
    <State icon={icon ?? <InboxOutlinedIcon fontSize="inherit" />}>
      {children ?? ERROR.GENERAL.EMPTY}
    </State>
  )
}

export default Empty
