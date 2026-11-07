import { z } from 'zod'
import { atLeastOneField } from '../../utils/validate.js'

// `type` ainda não tem significado definido; a Entrega 1 substitui por grupos de categoria.
const categoryType = z.number().int().min(0).max(99)

export const createCategorySchema = z.object({
	name: z.string().trim().min(1).max(40),
	type: categoryType.default(1)
})

export const updateCategorySchema = z.object({
	name: z.string().trim().min(1).max(40),
	type: categoryType
}).partial().refine(atLeastOneField, 'at least one field is required')
