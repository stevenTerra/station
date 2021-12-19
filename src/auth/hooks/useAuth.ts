import { useCallback } from "react"
import { atom, useRecoilState } from "recoil"
import { encode } from "js-base64"
import { CreateTxOptions, RawKey } from "@terra-money/terra.js"
import { useLCDClient } from "data/Terra/lcdClient"
import { PasswordError } from "../scripts/keystore"
import { getDecryptedKey, testPassword } from "../scripts/keystore"
import { getUser, storeUser, clearUser } from "../scripts/keystore"
import { getStoredAccount, getStoredAccounts } from "../scripts/keystore"
import encrypt from "../scripts/encrypt"
import useAvailable from "./useAvailable"

const userState = atom({
  key: "user",
  default: getUser(),
})

const useAuth = () => {
  const lcd = useLCDClient()
  const available = useAvailable()

  const [user, setUser] = useRecoilState(userState)
  const accounts = getStoredAccounts()

  /* connect | disconnect */
  const connect = useCallback(
    (name: string) => {
      const { address } = getStoredAccount(name)
      const user = { name, address }
      storeUser(user)
      setUser(user)
    },
    [setUser]
  )

  const disconnect = useCallback(() => {
    clearUser()
    setUser(undefined)
  }, [setUser])

  /* helpers */
  const getConnectedUser = () => {
    if (!user) throw new Error("Wallet is not connected")
    return user
  }

  const getKey = (password: string) => {
    const { name } = getConnectedUser()
    return getDecryptedKey({ name, password })
  }

  /* manage: export */
  const encodeEncryptedAccount = (password: string) => {
    const { name, address } = getConnectedUser()
    const key = getKey(password)
    const data = { name, address, encrypted_key: encrypt(key, password) }
    return encode(JSON.stringify(data))
  }

  /* form */
  const validatePassword = (password: string) => {
    try {
      const { name } = getConnectedUser()
      return testPassword({ name, password })
    } catch (error) {
      return "Incorrect password"
    }
  }

  /* tx */
  const post = async (txOptions: CreateTxOptions, password: string) => {
    const pk = getKey(password)
    if (!pk) throw new PasswordError("Incorrect password")
    const rk = new RawKey(Buffer.from(pk, "hex"))
    const wallet = lcd.wallet(rk)
    const signedTx = await wallet.createAndSignTx(txOptions)
    return { result: await lcd.tx.broadcastSync(signedTx) }
  }

  return {
    user,
    accounts,
    connect,
    disconnect,
    available,
    encodeEncryptedAccount,
    validatePassword,
    post,
  }
}

export default useAuth
