interface AccountHistory {
  limit: number
  next: number
  list: AccountHistoryItem[]
}

interface AccountHistoryItem {
  txhash: string
  timestamp: any
  success: boolean
  msgs?: TxMessage[]
  fee: CoinData[]
  memo?: string
  raw_log?: string
}

interface TxMessage {
  msgType: string
  canonicalMsg: string[]
}
