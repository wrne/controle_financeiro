import { db } from '../../../infra/db/database-connection.js'
import { logError } from '../../../utils/logger.js';
import { eq, and } from 'drizzle-orm';
import { budget } from '../../../infra/db/schemas.js';
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js';

export async function getAllBudgetRepo({ period, account, category } = {}) {

	try {

		const conditions = []
		if (period) conditions.push(eq(budget.period, period))
		if (account) conditions.push(eq(budget.account, account))
		if (category) conditions.push(eq(budget.category, category))

		const where = await applyUserFilter(budget, conditions.length ? and(...conditions) : null)
		const result = await db.select().from(budget).where(where)
		return result

	} catch (error) {
		logError(`Error listing budget: ${error.message}`, error);
		throw error;
	}

}

export async function getBudgetByIdRepo(id) {

	try {

		const result = await db.select().from(budget).where(await applyUserFilter(budget, eq(budget.id, id)))
		return result[0]

	} catch (error) {
		logError(`Error fetching budget: ${error.message}`, error);
		throw error;
	}

}

export async function createBudgetRepo({ amount, category, account, period }) {

	try {

		const result = await insert(budget, { amount, category, account, period })
		return result[0]

	} catch (error) {
		logError(`Error creating budget: ${error.message}`, error);
		throw error;
	}

}

export async function updateBudgetRepo(id, data) {

	try {

		return await updateById(budget, id, data)

	} catch (error) {
		logError(`Error updating budget: ${error.message}`, error);
		throw error;
	}

}

export async function deleteBudgetRepo(id) {

	try {

		const result = await db.delete(budget).where(await applyUserFilter(budget, eq(budget.id, id))).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting budget: ${error.message}`, error);
		throw error;
	}

}
