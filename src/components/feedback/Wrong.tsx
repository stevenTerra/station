import { FC } from "react"
import ERROR from "config/ERROR"
import State from "./State"

const Wrong: FC = ({ children }) => {
  return <State>{children ?? ERROR.GENERAL}</State>
}

export default Wrong
