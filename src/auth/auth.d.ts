type Bip = 118 | 330

interface User {
  name: string
  address: string
}

interface StoredAccount extends User {
  encrypted: string
}

interface StoredAccountLegacy extends User {
  wallet: string
}
