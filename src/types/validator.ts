import { Validator } from "@terra-money/terra.js"

export interface TerraValidator extends Validator.Data {
  picture?: string
  contact?: { email: string }
  miss_counter?: string
  voting_power?: string
  self?: string
}
