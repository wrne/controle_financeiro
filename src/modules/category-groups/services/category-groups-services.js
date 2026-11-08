import { AppError } from '../../../utils/app-error.js'
import {
	listGroupsRepo, getGroupByIdRepo, nextGroupSortOrderRepo, createGroupRepo,
	updateGroupRepo, countCategoriesInGroupRepo, deleteGroupRepo
} from '../repositories/category-groups-repository.js'
import { listCategoriesRepo } from '../../categories/repositories/categories-repository.js'

function strip({ userId, ...row }) {
	return row
}

function withCategories(groups, categories) {
	return groups.map((group) => ({ ...strip(group), categories: categories.filter((c) => c.groupId === group.id) }))
}

/** Grupos com as categorias de cada um, na ordem de exibição. */
export async function listGroups({ includeArchived = false } = {}) {
	const [groups, categories] = await Promise.all([
		listGroupsRepo({ includeArchived }),
		listCategoriesRepo({ includeArchived })
	])
	return withCategories(groups, categories)
}

export async function getGroup(id) {
	const group = await getGroupByIdRepo(id)
	if (!group) throw new AppError(404, 'group not found')
	const categories = await listCategoriesRepo({ groupId: id, includeArchived: true })
	return { ...group, categories }
}

export async function createGroup({ name, kind, resultClass = null, sortOrder }) {
	const order = sortOrder ?? await nextGroupSortOrderRepo()
	return strip(await createGroupRepo({ name, kind, resultClass: kind === 'RECEITA' ? null : resultClass, sortOrder: order }))
}

export async function updateGroup(id, { archived, ...data }) {
	const current = await getGroupByIdRepo(id)
	if (!current) throw new AppError(404, 'group not found')

	if ('resultClass' in data) {
		if (current.kind === 'RECEITA' && data.resultClass) throw new AppError(400, 'RECEITA groups have no resultClass')
		if (current.kind === 'DESPESA' && !data.resultClass) throw new AppError(400, 'DESPESA groups require a resultClass')
	}
	if (archived !== undefined) data.archivedAt = archived ? new Date() : null

	return strip(await updateGroupRepo(id, data))
}

export async function deleteGroup(id) {
	if (!(await getGroupByIdRepo(id))) throw new AppError(404, 'group not found')
	if (await countCategoriesInGroupRepo(id)) {
		throw new AppError(409, 'group has categories; move or delete them, or archive the group')
	}
	return deleteGroupRepo(id)
}
