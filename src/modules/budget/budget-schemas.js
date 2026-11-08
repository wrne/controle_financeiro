import { z } from 'zod'
import { uuid, amountCents, year, month, queryBoolean } from '../../utils/validate.js'

export const yearParams = z.object({ year })

export const gridFilters = z.object({
	includeArchived: queryBoolean.optional()
})

export const itemParams = z.object({ year, month, categoryId: uuid })

// null remove o orçado do mês (fica "sem orçado", diferente de R$ 0,00).
export const setItemSchema = z.object({
	amountCents: amountCents.nullable()
})

// Texto vazio (depois do trim) ou null remove o comentário.
export const setNoteSchema = z.object({
	note: z.string().trim().max(500).nullable().transform((v) => v || null)
})

export const replicateSchema = z.object({
	categoryId: uuid,
	fromMonth: z.number().int().min(1).max(11)
})
