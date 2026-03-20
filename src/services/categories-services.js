import { getAllCategoriesRepo, getCategoryByIdRepo, createCategoryRepo, deleteCategoryRepo } from '../repositories/categories-repository.js';

export async function getAllCategories(filtersParam) {
	return await getAllCategoriesRepo(filtersParam)
}

export async function getCategory(id) {
	return await getCategoryByIdRepo(id)

}

export async function createCategory({ name = 'NEW_CATEGORY', type = 1 }) {

	return await createCategoryRepo(name, type)

}

export async function updateCategory() {

}

export async function deleteCategory(id) {

	return await deleteCategoryRepo(id)

}
