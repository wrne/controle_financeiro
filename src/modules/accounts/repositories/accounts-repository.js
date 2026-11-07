import { db } from '../../../infra/db/database-connection.js'
import { logError } from '../../../utils/logger.js';
import { eq } from 'drizzle-orm';
import { accounts } from '../../../infra/db/schemas.js';
import { applyUserFilter, insert, updateById } from '../../../infra/repositories/_base-repository.js';

export async function getAllAccountsRepo() {

	try {

		const result = await db.select().from(accounts).where(await applyUserFilter(accounts))
		return result

	} catch (error) {
		logError(`Error listing accounts: ${error.message}`, error);
		throw error;
	}

}

export async function getAccountByIdRepo(id) {

	try {

		const result = await db.select().from(accounts).where(await applyUserFilter(accounts, eq(accounts.id, id)))
		return result[0]

	} catch (error) {
		logError(`Error fetching account: ${error.message}`, error);
		throw error;
	}

}

export async function createAccountRepo({ name, type }) {

	try {

		const result = await insert(accounts, { name, type })
		return result[0]

	} catch (error) {
		logError(`Error creating account: ${error.message}`, error);
		throw error;
	}

}

export async function updateAccountRepo(id, data) {

	try {

		return await updateById(accounts, id, data)

	} catch (error) {
		logError(`Error updating account: ${error.message}`, error);
		throw error;
	}

}

export async function deleteAccountRepo(id) {

	try {

		const result = await db.delete(accounts).where(await applyUserFilter(accounts, eq(accounts.id, id))).returning()
		return result[0]

	} catch (error) {
		logError(`Error deleting account: ${error.message}`, error);
		throw error;
	}

}
