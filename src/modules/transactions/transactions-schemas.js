import { z } from 'zod'
import { uuid, isoDate, money, atLeastOneField } from '../../utils/validate.js'

export const createTransactionSchema = z.object({
	date: isoDate,
	amount: money,
	account: uuid,
	category: uuid,
	period: uuid
})

export const updateTransactionSchema = z.object({
	date: isoDate,
	amount: money,
	account: uuid,
	category: uuid,
	period: uuid
}).partial().refine(atLeastOneField, 'at least one field is required')

export const transactionFilters = z.object({
	period: uuid.optional(),
	account: uuid.optional(),
	category: uuid.optional(),
	from: isoDate.optional(),
	to: isoDate.optional(),
	limit: z.coerce.number().int().min(1).max(500).default(200),
	offset: z.coerce.number().int().min(0).default(0)
}).refine((f) => !f.from || !f.to || f.from <= f.to, { message: 'from must be on or before to', path: ['to'] })
