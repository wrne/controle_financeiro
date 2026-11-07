import { db } from '../../../infra/db/database-connection.js'
import { logError } from '../../../utils/logger.js';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { transactions } from '../../../infra/db/schemas.js';
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js';

export async function getAllTransactionsRepo({ period, account, category, from, to, limit = 200, offset = 0 } = {}) {

	try {

		const conditions = []
		if (period) conditions.push(eq(transactions.period, period))
		if (account) conditions.push(eq(transactions.account, account))
		if (category) conditions.push(eq(transactions.category, category))
		if (from) conditions.push(gte(transactions.date, from))
		if (to) conditions.push(lte(transactions.date, to))

		const where = await applyUserFilter(transactions, conditions.length ? and(...conditions) : null)
		const result = await db.select().from(transactions).where(where)
			.orderBy(desc(transactions.date), desc(transactions.createdAt))
			.limit(limit).offset(offset)
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

export async function updateTransactionRepo(id, data) {

	try {

		return await updateById(transactions, id, data)

	} catch (error) {
		logError(`Error updating transaction: ${error.message}`, error);
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
