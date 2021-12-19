import { ReactNode, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { MnemonicKey } from "@terra-money/terra.js"
import createContext from "utils/createContext"
import { addAccount } from "../../scripts/keystore"
import CreateWalletForm from "./CreateWalletForm"
import CreatedUser from "./CreatedUser"

export interface Values {
  name: string
  password: string
  mnemonic: string
}

/* context */
interface CreateWallet {
  /* step */
  setStep: (index: number) => void

  /* form values */
  generated: boolean
  values: Values
  setValues: (values: Values) => void

  /* create user */
  createdUser?: User
  createUser: (coinType: Bip) => void
}

export const [useCreateWallet, CreateWalletProvider] =
  createContext<CreateWallet>("useCreateWallet")

interface Props {
  defaultMnemonic?: string
  beforeCreate: ReactNode
}

const DefaultValues = { name: "", password: "", mnemonic: "" }

const CreateWalletWizard = ({ defaultMnemonic = "", beforeCreate }: Props) => {
  /* step */
  const location = useLocation()
  const navigate = useNavigate()
  const step = Number(location.hash.replace("#", "")) || 1
  const setStep = (index: number) => navigate({ hash: String(index) })

  /* form values */
  const initial = { ...DefaultValues, mnemonic: defaultMnemonic }
  const [values, setValues] = useState(initial)

  /* create user */
  const [createdUser, setCreatedUser] = useState<User>()
  const createUser = (coinType: Bip) => {
    const { name, password, mnemonic } = values
    const mk = new MnemonicKey({ mnemonic, coinType })
    const address = mk.accAddress
    addAccount({ name, password, address, key: mk.privateKey })
    setCreatedUser({ name, address })
    setStep(3)
  }

  /* effect: reset memory on unmount */
  useEffect(() => {
    return () => {
      setValues(DefaultValues)
      setCreatedUser(undefined)
    }
  }, [setValues])

  /* render */
  const render = () => {
    switch (step) {
      case 1:
        return <CreateWalletForm />

      case 2:
        if (!values.mnemonic) setStep(1)
        return beforeCreate

      case 3:
        return <CreatedUser />
    }
  }

  const generated = !!defaultMnemonic
  const value = {
    setStep,
    generated,
    values,
    setValues,
    createdUser,
    createUser,
  }

  return <CreateWalletProvider value={value}>{render()}</CreateWalletProvider>
}

export default CreateWalletWizard
