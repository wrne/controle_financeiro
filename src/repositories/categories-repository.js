import { db } from '../infra/db/database-connection.js'
import { logError } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { categories } from '../infra/db/schemas.js';
import { applyUserFilter, insert } from './_base-repository.js';


export async function getAllCategoriesRepo() {

	try {

		const result = await db.select().from(categories).where(await applyUserFilter(categories))
		return result

	} catch (error) {
		logError(`Error listing categories: ${error.message}`, error);
		throw error;
	}

}

export async function getCategoryByIdRepo(id) {

	try {

		const result = await db.select().from(categories).where(await applyUserFilter(categories, eq(categories.id, id)))
		return result[0]

	} catch (error) {
		logError(`Error fetching category: ${error.message}`, error);
		throw error;
	}

}

export async function createCategoryRepo(name, type) {

	try {

		const result = await insert(categories, { name, type })
		return result[0]

	} catch (error) {
		logError(`Error creating category: ${error.message}`, error);
		throw error;
	}

}

export async function deleteCategoryRepo(id) {

	try {

		const result = await db.delete(categories).where(await applyUserFilter(categories, eq(categories.id, id))).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting category: ${error.message}`, error);
		throw error;
	}

}
