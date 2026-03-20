import { logInfo } from "../utils/logger.js"
import { getAllCategories, getCategory, createCategory, updateCategory, deleteCategory } from "../services/categories-services.js"

export async function getAllCategoriesController(req, res) {

	try {
		const categoriesList = await getAllCategories(req.query)
		logInfo(`categories list retrieved successful`)

		res.success(categoriesList, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting categories')
	}

}

export async function getCategoryController(req, res) {

	try {
		const category = await getCategory(req.params.id)
		logInfo(`category retrieved successful`)

		res.success(category, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting categories')
	}

}


export async function createCategoryController(req, res) {

	try {
		const category = await createCategory(req.body)
		logInfo(`category created successful`)

		res.success(category, 'category created successful.')


	} catch (error) {
		res.error(400, error, 'Failure on creating categories')
	}

}


export async function updateCategoryController(req, res) {

	try {
		const category = await updateCategory(req.params.id, req.body)
		logInfo(`category updated successful`)

		res.success(category, 'category updated successful.')


	} catch (error) {
		res.error(400, error, 'Failure on updating categories')
	}

}


export async function deleteCategoryController(req, res) {

	try {
		const category = await deleteCategory(req.params.id)
		logInfo(`category deleted successful`)

		res.success(category, 'category deleted successful.')


	} catch (error) {
		res.error(400, error, 'Failure on deleting categories')
	}

}
