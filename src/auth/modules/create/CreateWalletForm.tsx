import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import { Copy } from "components/general"
import { Form, FormItem, FormWarning, Submit } from "components/form"
import { Checkbox, Input, TextArea } from "components/form"
import validate from "../../scripts/validate"
import { useCreateWallet, Values as DefaultValues } from "./CreateWalletWizard"

interface Values extends DefaultValues {
  confirm: string
  checked?: boolean
}

const CreateWalletForm = () => {
  const { t } = useTranslation()
  const { setStep, generated, values, setValues } = useCreateWallet()

  /* form */
  const form = useForm<Values>({
    mode: "onChange",
    defaultValues: { ...values, confirm: "", checked: false },
  })

  const { register, watch, handleSubmit, formState } = form
  const { errors, isValid } = formState
  const { mnemonic, password, checked } = watch()

  const submit = ({ name, password, mnemonic }: Values) => {
    setValues({ name, password, mnemonic: mnemonic.trim() })
    setStep(2)
  }

  return (
    <Form onSubmit={handleSubmit(submit)}>
      <FormItem label={t("Wallet name")} error={errors.name?.message}>
        <Input {...register("name", { validate: validate.name })} autoFocus />
      </FormItem>

      <FormItem label={t("Password")} error={errors.password?.message}>
        <Input
          {...register("password", { validate: validate.password })}
          type="password"
        />
      </FormItem>

      <FormItem label={t("Confirm password")} error={errors.confirm?.message}>
        <Input
          {...register("confirm", {
            validate: (confirm) => validate.confirm(password, confirm),
          })}
          type="password"
        />
      </FormItem>

      <FormItem
        label={t("Mnemonic")}
        extra={generated && <Copy text={mnemonic} />}
        error={errors.mnemonic?.message}
      >
        <TextArea
          {...register("mnemonic", { validate: validate.mnemonic })}
          readOnly={generated}
        />
      </FormItem>

      {generated && (
        <>
          <FormWarning>
            {t(
              "We cannot recover your information for you. If you lose your seed phrase it's gone forever. Terra Station does not store your mnemonic."
            )}
          </FormWarning>
          <Checkbox
            {...register("checked", { required: true })}
            checked={checked}
          >
            {t(
              "I have securely written down my seed. I understand that lost seeds cannot be recovered."
            )}
          </Checkbox>
        </>
      )}

      <Submit disabled={!isValid} />
    </Form>
  )
}

export default CreateWalletForm
