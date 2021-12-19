import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useForm } from "react-hook-form"
import update from "immutability-helper"
import classNames from "classnames/bind"
import numeral from "numeral"
import CheckIcon from "@mui/icons-material/Check"
import DangerousOutlinedIcon from "@mui/icons-material/DangerousOutlined"
import shuffle from "utils/shuffle"
import { Modal } from "components/feedback"
import { Form, FormItem, Submit } from "components/form"
import { useCreateWallet } from "./CreateWalletWizard"
import styles from "./Quiz.module.scss"

const cx = classNames.bind(styles)

export interface QuizItem {
  index: number
  answer: string
}

const Quiz = () => {
  const { t } = useTranslation()
  const { setStep, values, createWallet } = useCreateWallet()
  const { mnemonic } = values

  /* quiz */
  const { quiz, hint, win } = useMemo(() => createQuiz(mnemonic), [mnemonic])
  const [answers, setAnswers] = useState<[string, string]>(["", ""])

  /* submit */
  const { handleSubmit } = useForm()
  const [incorrect, setIncorrect] = useState(false)
  const submit = () => (win(answers) ? createWallet(330) : setIncorrect(true))
  const reset = () => setStep(1)

  return (
    <Form onSubmit={handleSubmit(submit)}>
      {incorrect && (
        <Modal
          isOpen
          onRequestClose={() => setIncorrect(false)}
          icon={<DangerousOutlinedIcon fontSize="inherit" className="danger" />}
          closeIcon={false}
          title={t("Wrong!")}
          footer={(close) => (
            <Submit type="button" onClick={close}>
              {t("Ok")}
            </Submit>
          )}
        >
          <p className="center">
            {t("Write down mnemonic and choose the correct word")}
          </p>
        </Modal>
      )}

      {quiz.map(({ index }, i) => (
        <FormItem
          // do not translate this unless you find a simple way to handle ordinal
          label={`${numeral(index + 1).format("0o")} word`}
          key={index}
        >
          <section className={styles.hint}>
            {hint.map((word) => {
              const handleClick = () => {
                const next = update(answers, { [i]: { $set: word } })
                setAnswers(next)
              }

              const checked = answers[i] === word

              return (
                <button
                  type="button"
                  className={cx(styles.item, { active: checked })}
                  onClick={handleClick}
                  key={word}
                >
                  {checked && <CheckIcon className={styles.check} />}
                  {word}
                </button>
              )
            })}
          </section>
        </FormItem>
      ))}

      <Submit disabled={answers.some((answer) => !answer)} />
      <button onClick={reset}>{t("I haven't written down my seed.")}</button>
    </Form>
  )
}

export default Quiz

/* helpers */
const createQuiz = (mnemonic: string) => {
  const deck = mnemonic.split(" ").map((answer, index) => ({ index, answer }))
  const draw = shuffle(deck).slice(0, 6)
  const quiz = draw.slice(0, 2) as [QuizItem, QuizItem]

  return {
    quiz,
    hint: shuffle(draw.map(({ answer }) => answer)),
    win: (answers: [string, string]) =>
      answers.every((answer, index) => quiz[index].answer === answer),
  }
}
