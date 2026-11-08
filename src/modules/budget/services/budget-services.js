import { AppError } from '../../../utils/app-error.js'
import { assertReferences } from '../../../infra/repositories/ownership-repository.js'
import { buildBudgetGrid, monthsByCategory, emptyMonths, replicateFrom } from '../budget-grid.js'
import {
	getYearDataRepo, getCategoryYearItemsRepo, upsertItemRepo, deleteItemRepo, replaceMonthsAfterRepo,
	upsertNoteRepo, deleteNoteRepo
} from '../repositories/budget-repository.js'

async function assertActiveCategory(categoryId) {
	const { category } = await assertReferences({ category: categoryId })
	if (category.archivedAt) throw new AppError(400, 'category is archived')
}

export async function getBudgetGrid(year, { includeArchived = false } = {}) {
	const data = await getYearDataRepo(year, { withNotes: true })
	return buildBudgetGrid({ year, ...data, includeArchived })
}

/** Grava (ou remove, com null) o orçado de uma categoria num mês. */
export async function setBudgetItem({ year, month, categoryId }, { amountCents }) {
	await assertActiveCategory(categoryId)

	if (amountCents === null) {
		await deleteItemRepo({ categoryId, year, month })
		return { categoryId, year, month, amountCents: null }
	}
	return upsertItemRepo({ categoryId, year, month, amountCents })
}

/** Grava (ou remove, com texto vazio ou null) o comentário de uma célula. Categoria arquivada: só leitura. */
export async function setBudgetNote({ year, month, categoryId }, { note }) {
	await assertActiveCategory(categoryId)

	if (!note) {
		await deleteNoteRepo({ categoryId, year, month })
		return { categoryId, year, month, note: null }
	}
	return upsertNoteRepo({ categoryId, year, month, note })
}

/** Copia o valor de fromMonth para os meses seguintes do ano. Devolve os 12 meses da categoria. */
export async function replicateBudget(year, { categoryId, fromMonth }) {
	await assertActiveCategory(categoryId)

	const current = monthsByCategory(await getCategoryYearItemsRepo(categoryId, year)).get(categoryId) ?? emptyMonths()
	const months = replicateFrom(current, fromMonth)
	const saved = await replaceMonthsAfterRepo({ categoryId, year, fromMonth, months })

	return { categoryId, year, months: monthsByCategory(saved).get(categoryId) ?? emptyMonths() }
}
