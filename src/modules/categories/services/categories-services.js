import { AppError } from '../../../utils/app-error.js'
import { assertReferences } from '../../../infra/repositories/ownership-repository.js'
import {
	listCategoriesRepo, getCategoryByIdRepo, nextCategorySortOrderRepo, createCategoryRepo,
	updateCategoryRepo, isCategoryInUseRepo, deleteCategoryRepo
} from '../repositories/categories-repository.js'

function strip({ userId, ...row }) {
	return row
}

async function assertActiveGroup(groupId) {
	const { group } = await assertReferences({ group: groupId })
	if (group.archivedAt) throw new AppError(400, 'group is archived')
}

export async function getAllCategories(filters) {
	return listCategoriesRepo(filters)
}

export async function getCategory(id) {
	const row = await getCategoryByIdRepo(id)
	if (!row) throw new AppError(404, 'category not found')
	return row
}

export async function createCategory({ groupId, name, sortOrder }) {
	await assertActiveGroup(groupId)
	const order = sortOrder ?? await nextCategorySortOrderRepo(groupId)
	return strip(await createCategoryRepo({ groupId, name, sortOrder: order }))
}

export async function updateCategory(id, { archived, ...data }) {
	if (!(await getCategoryByIdRepo(id))) throw new AppError(404, 'category not found')
	if (data.groupId) await assertActiveGroup(data.groupId)
	if (archived !== undefined) data.archivedAt = archived ? new Date() : null

	return strip(await updateCategoryRepo(id, data))
}

export async function deleteCategory(id) {
	if (!(await getCategoryByIdRepo(id))) throw new AppError(404, 'category not found')
	if (await isCategoryInUseRepo(id)) {
		throw new AppError(409, 'category is in use (budget or transactions); archive it instead')
	}
	return deleteCategoryRepo(id)
}
