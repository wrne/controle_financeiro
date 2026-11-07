import { db } from '../../../infra/db/database-connection.js'
import { logError } from '../../../utils/logger.js';
import { eq, and } from 'drizzle-orm';
import { periods } from '../../../infra/db/schemas.js';
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js';

export async function getAllPeriodsRepo({ account } = {}) {

	try {

		const conditions = []
		if (account) conditions.push(eq(periods.account, account))

		const where = await applyUserFilter(periods, conditions.length ? and(...conditions) : null)
		const result = await db.select().from(periods).where(where)
		return result

	} catch (error) {
		logError(`Error listing periods: ${error.message}`, error);
		throw error;
	}

}

export async function getPeriodByIdRepo(id) {

	try {

		const result = await db.select().from(periods).where(await applyUserFilter(periods, eq(periods.id, id)))
		return result[0]

	} catch (error) {
		logError(`Error fetching period: ${error.message}`, error);
		throw error;
	}

}

export async function createPeriodRepo({ description, account, initialDate, finalDate }) {

	try {

		const result = await insert(periods, { description, account, initialDate, finalDate })
		return result[0]

	} catch (error) {
		logError(`Error creating period: ${error.message}`, error);
		throw error;
	}

}

export async function updatePeriodRepo(id, data) {

	try {

		return await updateById(periods, id, data)

	} catch (error) {
		logError(`Error updating period: ${error.message}`, error);
		throw error;
	}

}

export async function deletePeriodRepo(id) {

	try {

		const result = await db.delete(periods).where(await applyUserFilter(periods, eq(periods.id, id))).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting period: ${error.message}`, error);
		throw error;
	}

}
