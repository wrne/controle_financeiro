import { z } from 'zod'
import { uuid, isoDate, atLeastOneField } from '../../utils/validate.js'

const periodFields = z.object({
	description: z.string().trim().min(1).max(40),
	account: uuid.nullable(),
	initialDate: isoDate,
	finalDate: isoDate.nullable()
})

const finalAfterInitial = (p) => !p.initialDate || !p.finalDate || p.finalDate >= p.initialDate
const finalAfterInitialMsg = { message: 'finalDate must be on or after initialDate', path: ['finalDate'] }

export const createPeriodSchema = periodFields.partial().refine(finalAfterInitial, finalAfterInitialMsg)

export const updatePeriodSchema = periodFields.partial()
	.refine(atLeastOneField, 'at least one field is required')
	.refine(finalAfterInitial, finalAfterInitialMsg)

export const periodFilters = z.object({
	account: uuid.optional()
})
