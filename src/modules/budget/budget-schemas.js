import { z } from 'zod'
import { uuid, money, atLeastOneField } from '../../utils/validate.js'

export const createBudgetSchema = z.object({
	amount: money.optional(),
	category: uuid,
	account: uuid,
	period: uuid
})

export const updateBudgetSchema = z.object({
	amount: money,
	category: uuid,
	account: uuid,
	period: uuid
}).partial().refine(atLeastOneField, 'at least one field is required')

export const budgetFilters = z.object({
	period: uuid.optional(),
	account: uuid.optional(),
	category: uuid.optional()
})
