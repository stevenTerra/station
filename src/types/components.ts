import { ReactNode } from "react"

export type Content = { title: string; content: ReactNode }
export type Contents = Content[]
export type Color = "info" | "warning" | "success" | "danger" | "default"
