import { z } from 'zod'
import { atLeastOneField } from '../../utils/validate.js'

// Tipos de conta: 1 = conta corrente, 2 = cartão de crédito
const accountType = z.number().int().min(1).max(2)

export const createAccountSchema = z.object({
	name: z.string().trim().min(1).max(40),
	type: accountType.default(1)
})

export const updateAccountSchema = z.object({
	name: z.string().trim().min(1).max(40),
	type: accountType
}).partial().refine(atLeastOneField, 'at least one field is required')
