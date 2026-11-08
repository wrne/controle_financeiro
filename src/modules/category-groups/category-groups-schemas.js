import { z } from 'zod'
import { atLeastOneField, queryBoolean } from '../../utils/validate.js'

export const KINDS = ['RECEITA', 'DESPESA']
export const RESULT_CLASSES = ['TRABALHO', 'BASICO', 'INVESTIMENTO']

const name = z.string().trim().min(1).max(40)
const resultClass = z.enum(RESULT_CLASSES)
const sortOrder = z.number().int().min(0).max(9999)

// Grupo de receita não tem classificação; grupo de despesa precisa ter (define a linha do Resultado).
export const createGroupSchema = z.object({
	name,
	kind: z.enum(KINDS),
	resultClass: resultClass.nullable().optional(),
	sortOrder: sortOrder.optional()
}).superRefine((group, ctx) => {
	if (group.kind === 'RECEITA' && group.resultClass) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['resultClass'], message: 'must be empty for RECEITA groups' })
	}
	if (group.kind === 'DESPESA' && !group.resultClass) {
		ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['resultClass'], message: 'is required for DESPESA groups' })
	}
})

// O kind não muda depois de criado (mudaria o sentido de todo o orçado do grupo).
export const updateGroupSchema = z.object({
	name,
	resultClass: resultClass.nullable(),
	sortOrder,
	archived: z.boolean()
}).partial().refine(atLeastOneField, 'at least one field is required')

export const groupFilters = z.object({
	includeArchived: queryBoolean.optional()
})
