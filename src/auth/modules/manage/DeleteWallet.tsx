import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, Page } from "components/layout"
import { Form, FormItem, FormWarning, Input, Submit } from "components/form"
import { deleteAccount } from "../../scripts/keystore"
import useAuth from "../../hooks/useAuth"
import ConnectedAccount from "./ConnectedAccount"
import ConfirmModal from "./ConfirmModal"

interface Values {
  password: string
}

const DeleteWallet = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, disconnect, validatePassword } = useAuth()

  /* form */
  const form = useForm<Values>()
  const { register, handleSubmit, formState } = form
  const { errors } = formState

  const [done, setDone] = useState(false)
  const submit = ({ password }: Values) => {
    if (!user) throw new Error("Wallet is not connected")
    const { name } = user
    disconnect()
    deleteAccount({ name, password })
    setDone(true)
  }

  return (
    <Page title={t("Delete wallet")}>
      <ConnectedAccount>
        <Card>
          {done && (
            <ConfirmModal
              title={t("Wallet deleted successfully")}
              onRequestClose={() => navigate("/", { replace: true })}
            />
          )}

          <Form onSubmit={handleSubmit(submit)}>
            <FormItem label={t("Password")} error={errors.password?.message}>
              <Input
                {...register("password", { validate: validatePassword })}
                type="password"
                autoFocus
              />
            </FormItem>

            <FormWarning>
              {t("This wallet cannot be recovered without seed phrase")}
            </FormWarning>
            <Submit />
          </Form>
        </Card>
      </ConnectedAccount>
    </Page>
  )
}

export default DeleteWallet
