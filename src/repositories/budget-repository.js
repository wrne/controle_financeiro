import { db } from '../infra/db/database-connection.js'
import { logError } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { budget } from '../infra/db/schemas.js';

export async function getAllBudgetRepo() {

	try {

		const result = await db.select().from(budget)
		return result

	} catch (error) {
		logError(`Error listing budget: ${error.message}`, error);
		throw error;
	}

}

export async function getBudgetByIdRepo(id) {

	try {

		const result = await db.select().from(budget).where(eq(budget.id, id))
		return result[0]

	} catch (error) {
		logError(`Error fetching budget: ${error.message}`, error);
		throw error;
	}

}

export async function createBudgetRepo({ amount, category, account, period }) {

	try {

		const result = await db.insert(budget).values({ amount, category, account, period }).returning()
		return result[0]

	} catch (error) {
		logError(`Error creating budget: ${error.message}`, error);
		throw error;
	}

}

export async function deleteBudgetRepo(id) {

	try {

		const result = await db.delete(budget).where(eq(budget.id, id)).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting budget: ${error.message}`, error);
		throw error;
	}

}
