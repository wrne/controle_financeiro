import { db } from '../infra/db/database-connection.js'
import { logError, logInfo } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { accounts } from '../infra/db/schemas.js';

export async function getAllAccountsRepo(){

	try {

		// const result = db.insert(user).values({ id: uudi, login, name, password: `${hash}:${salt}` }).returning()
		const result = await db.select().from(accounts)
		return result
		
	} catch (error) {
		logError(`Error listing accounts: ${error.message}`,error);
		throw error;
	}

}

export async function getAccountByIdRepo(id){

	try {

		// const result = db.insert(user).values({ id: uudi, login, name, password: `${hash}:${salt}` }).returning()
		const result = await db.select().from(accounts).where(eq(accounts.id, id))
		return result[0]
		
	} catch (error) {
		logError(`Error fetching account: ${error.message}`,error);
		throw error;
	}

}

export async function createAccountRepo(name, type){

	try {

		const result = await db.insert(accounts).values({ name, type }).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error creating account: ${error.message}`,error);
		throw error;
	}

}

export async function deleteAccountRepo(id){

	try {

		const result = await db.delete(accounts).where(eq(accounts.id, id)).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error deleting account: ${error.message}`,error);
		throw error;
	}

}