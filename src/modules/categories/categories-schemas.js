import { z } from 'zod'
import { uuid, atLeastOneField, queryBoolean } from '../../utils/validate.js'

const name = z.string().trim().min(1).max(40)
const sortOrder = z.number().int().min(0).max(9999)

export const createCategorySchema = z.object({
	groupId: uuid,
	name,
	sortOrder: sortOrder.optional()
})

// archived: true arquiva (some das listagens e da grade, mas o histórico fica); false desarquiva.
export const updateCategorySchema = z.object({
	groupId: uuid,
	name,
	sortOrder,
	archived: z.boolean()
}).partial().refine(atLeastOneField, 'at least one field is required')

export const categoryFilters = z.object({
	groupId: uuid.optional(),
	includeArchived: queryBoolean.optional()
})
