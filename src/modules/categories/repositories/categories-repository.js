import { db } from '../../../infra/db/database-connection.js'
import { and, asc, eq, isNull, max } from 'drizzle-orm'
import { budgetItems, categories, transactions } from '../../../infra/db/schemas.js'
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js'

// Colunas devolvidas ao cliente (sem user_id).
export const categoryColumns = {
	id: categories.id,
	groupId: categories.groupId,
	name: categories.name,
	sortOrder: categories.sortOrder,
	archivedAt: categories.archivedAt,
	createdAt: categories.createdAt,
	updatedAt: categories.updatedAt
}

export async function listCategoriesRepo({ groupId, includeArchived = false } = {}) {
	const conditions = []
	if (groupId) conditions.push(eq(categories.groupId, groupId))
	if (!includeArchived) conditions.push(isNull(categories.archivedAt))

	return db.select(categoryColumns).from(categories)
		.where(await applyUserFilter(categories, conditions.length ? and(...conditions) : null))
		.orderBy(asc(categories.sortOrder), asc(categories.name))
}

export async function getCategoryByIdRepo(id) {
	const rows = await db.select(categoryColumns).from(categories)
		.where(await applyUserFilter(categories, eq(categories.id, id)))
	return rows[0]
}

export async function nextCategorySortOrderRepo(groupId) {
	const rows = await db.select({ value: max(categories.sortOrder) }).from(categories)
		.where(await applyUserFilter(categories, eq(categories.groupId, groupId)))
	return (rows[0]?.value ?? 0) + 1
}

export async function createCategoryRepo(data) {
	const rows = await insert(categories, data)
	return rows[0]
}

export async function updateCategoryRepo(id, data) {
	return updateById(categories, id, data)
}

/** A categoria tem orçado ou lançamentos? (nesse caso não pode ser apagada, só arquivada) */
export async function isCategoryInUseRepo(id) {
	const [budget, txs] = await Promise.all([
		db.select({ id: budgetItems.id }).from(budgetItems)
			.where(await applyUserFilter(budgetItems, eq(budgetItems.categoryId, id))).limit(1),
		db.select({ id: transactions.id }).from(transactions)
			.where(await applyUserFilter(transactions, eq(transactions.category, id))).limit(1)
	])
	return budget.length > 0 || txs.length > 0
}

export async function deleteCategoryRepo(id) {
	const rows = await db.delete(categories)
		.where(await applyUserFilter(categories, eq(categories.id, id)))
		.returning(categoryColumns)
	return rows[0]
}
