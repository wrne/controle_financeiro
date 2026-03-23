import { db } from '../infra/db/database-connection.js'
import { logError } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { transactions } from '../infra/db/schemas.js';
import { applyUserFilter, insert } from './_base-repository.js';

export async function getAllTransactionsRepo() {

	try {

		const result = await db.select().from(transactions).where(await applyUserFilter(transactions))
		return result

	} catch (error) {
		logError(`Error listing transactions: ${error.message}`, error);
		throw error;
	}

}

export async function getTransactionByIdRepo(id) {

	try {

		const result = await db.select().from(transactions).where(await applyUserFilter(transactions, eq(transactions.id, id)))
		return result[0]

	} catch (error) {
		logError(`Error fetching transaction: ${error.message}`, error);
		throw error;
	}

}

export async function createTransactionRepo({ date, amount, account, category, period }) {

	try {

		const result = await insert(transactions, { date, amount, account, category, period })
		return result[0]

	} catch (error) {
		logError(`Error creating transaction: ${error.message}`, error);
		throw error;
	}

}

export async function deleteTransactionRepo(id) {

	try {

		const result = await db.delete(transactions).where(await applyUserFilter(transactions, eq(transactions.id, id))).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting transaction: ${error.message}`, error);
		throw error;
	}

}
