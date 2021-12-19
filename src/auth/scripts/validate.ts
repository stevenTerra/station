import { getStoredWallet } from "./keystore"
import wordlist from "./wordlist.json"

const validate = {
  name: {
    length: (name: string) =>
      (name.length >= 3 && name.length <= 20) ||
      "Enter 3-20 alphanumeric characters",
    exists: (name: string) => {
      try {
        const { address } = getStoredWallet(name)
        return `Already exists with: ${address}`
      } catch {
        return true
      }
    },
  },

  password: {
    required: (password: string) => !!password.length || "Password is required",
    length: (password: string) =>
      password.length >= 10 || "Password must be longer than 10 characters",
  },

  confirm: (password: string, confirm: string) =>
    password === confirm || "Password does not match",

  mnemonic: {
    length: (mnemonic: string) => {
      const seed = mnemonic.trim().split(" ")
      return seed.length === 12 || seed.length === 24 || "Invalid mnemonic"
    },
    wordlist: (mnemonic: string) => {
      const seed = mnemonic.trim().split(" ")
      const invalid = seed.find((word) => !wordlist.includes(word))
      return !invalid || `${invalid} is an invalid word`
    },
  },
}

export default validate
