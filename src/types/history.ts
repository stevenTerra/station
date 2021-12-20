export interface AccountHistory {
  next: number
  limit: number
  txs: AccountHistoryItem[]
}

export interface AccountHistoryItem {
  id: number
  chainId: string
  tx: Tx
  logs: Log[]
  height: string
  txhash: string
  raw_log: string
  gas_used: string
  gas_wanted: string
  timestamp: Date
}

export interface Log {
  log: { tax: string }
  events: Event[]
  msg_index: number
}

export interface Event {
  type: string
  attributes: Attribute[]
}

export interface Attribute {
  key: string
  value: string
}

export interface Tx {
  type: string
  value: Value
}

export interface Value {
  fee: Fee
  msg: Msg[]
  memo: string
  signatures: Signature[]
  timeout_height: string
}

export interface Signature {
  pub_key: PubKey
  signature: string
}

export interface PubKey {
  type: string
  value: string
}

export interface Msg {
  type: string
  value: object
}

export interface Fee {
  gas: string
  amount: Amount[]
}

export interface Amount {
  denom: string
  amount: string
}
