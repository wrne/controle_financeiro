import { db } from '../../../infra/db/database-connection.js'
import { asc, eq, isNull, max } from 'drizzle-orm'
import { categories, categoryGroups } from '../../../infra/db/schemas.js'
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js'

// Colunas devolvidas ao cliente (sem user_id).
export const groupColumns = {
	id: categoryGroups.id,
	name: categoryGroups.name,
	kind: categoryGroups.kind,
	resultClass: categoryGroups.resultClass,
	sortOrder: categoryGroups.sortOrder,
	archivedAt: categoryGroups.archivedAt,
	createdAt: categoryGroups.createdAt,
	updatedAt: categoryGroups.updatedAt
}

export async function listGroupsRepo({ includeArchived = false } = {}) {
	const condition = includeArchived ? null : isNull(categoryGroups.archivedAt)
	return db.select(groupColumns).from(categoryGroups)
		.where(await applyUserFilter(categoryGroups, condition))
		.orderBy(asc(categoryGroups.sortOrder), asc(categoryGroups.name))
}

export async function getGroupByIdRepo(id) {
	const rows = await db.select(groupColumns).from(categoryGroups)
		.where(await applyUserFilter(categoryGroups, eq(categoryGroups.id, id)))
	return rows[0]
}

export async function nextGroupSortOrderRepo() {
	const rows = await db.select({ value: max(categoryGroups.sortOrder) }).from(categoryGroups)
		.where(await applyUserFilter(categoryGroups))
	return (rows[0]?.value ?? 0) + 1
}

export async function createGroupRepo(data) {
	const rows = await insert(categoryGroups, data)
	return rows[0]
}

export async function updateGroupRepo(id, data) {
	return updateById(categoryGroups, id, data)
}

export async function countCategoriesInGroupRepo(groupId) {
	const rows = await db.select({ id: categories.id }).from(categories)
		.where(await applyUserFilter(categories, eq(categories.groupId, groupId)))
		.limit(1)
	return rows.length
}

export async function deleteGroupRepo(id) {
	const rows = await db.delete(categoryGroups)
		.where(await applyUserFilter(categoryGroups, eq(categoryGroups.id, id)))
		.returning(groupColumns)
	return rows[0]
}
