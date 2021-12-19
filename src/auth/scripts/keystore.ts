import encrypt from "./encrypt"
import decrypt from "./decrypt"

/* user */
export const getUser = () => {
  const settings = JSON.parse(localStorage.getItem("settings") ?? "{}")
  return settings.user as User | undefined
}

export const storeUser = (user: User) => {
  localStorage.setItem("settings", JSON.stringify(user))
}

export const clearUser = () => {
  localStorage.removeItem("settings")
}

/* accounts */
export const getStoredAccounts = () => {
  const keys = localStorage.getItem("keys") ?? "[]"
  return JSON.parse(keys) as (StoredAccount | StoredAccountLegacy)[]
}

const storeAccounts = (accounts: (StoredAccount | StoredAccountLegacy)[]) => {
  localStorage.setItem("keys", JSON.stringify(accounts))
}

/* account */
export const getStoredAccount = (name: string) => {
  const accounts = getStoredAccounts()
  const account = accounts.find((account) => account.name === name)
  if (!account) throw new Error("Account does not exist")
  return account
}

interface Params {
  name: string
  password: string
}

export const getDecryptedKey = ({ name, password }: Params) => {
  const account = getStoredAccount(name)

  if ("encrypted" in account) return decrypt(account.encrypted, password)

  // legacy
  const { privateKey: key } = JSON.parse(decrypt(account.wallet, password))
  return key as string
}

export class PasswordError extends Error {}
export const testPassword = (params: Params) => {
  if (!getDecryptedKey(params)) throw new PasswordError("Incorrect password")
  return true
}

interface AddAccountParams extends Params, User {
  key: Buffer
}

export const addAccount = (params: AddAccountParams) => {
  const { name, password, address, key } = params
  const accounts = getStoredAccounts()
  if (accounts.find((account) => account.name === name))
    throw new Error("Account already exists")
  const encrypted = encrypt(key.toString("hex"), password)
  const next = accounts.filter((account) => account.address !== address)
  storeAccounts([...next, { name, address, encrypted }])
}

interface ChangePasswordParams {
  name: string
  oldPassword: string
  newPassword: string
}

export const changePassword = (params: ChangePasswordParams) => {
  const { name, oldPassword, newPassword } = params
  testPassword({ name, password: oldPassword })
  const key = getDecryptedKey({ name, password: oldPassword })
  const encrypted = encrypt(key, newPassword)
  const accounts = getStoredAccounts()
  const next = accounts.map((account) => {
    if (account.name === name) {
      const { address } = account
      return { name, address, encrypted }
    }

    return account
  })

  storeAccounts(next)
}

export const deleteAccount = (params: Params) => {
  testPassword(params)
  const accounts = getStoredAccounts()
  const next = accounts.filter((account) => account.name !== params.name)
  storeAccounts(next)
}
