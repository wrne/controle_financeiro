import { AppError } from '../../../utils/app-error.js'
import { getAllCategoriesRepo, getCategoryByIdRepo, createCategoryRepo, updateCategoryRepo, deleteCategoryRepo } from '../repositories/categories-repository.js';

export async function getAllCategories(filters) {
	return await getAllCategoriesRepo(filters)
}

export async function getCategory(id) {
	const row = await getCategoryByIdRepo(id)
	if (!row) throw new AppError(404, 'category not found')
	return row
}

export async function createCategory({ name, type = 1 }) {
	return await createCategoryRepo({ name, type })
}

export async function updateCategory(id, data) {
	const row = await updateCategoryRepo(id, data)
	if (!row) throw new AppError(404, 'category not found')
	return row
}

export async function deleteCategory(id) {
	const row = await deleteCategoryRepo(id)
	if (!row) throw new AppError(404, 'category not found')
	return row
}
