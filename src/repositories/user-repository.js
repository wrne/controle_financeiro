import { db } from '../infra/db/database-connection.js'
import { logError, logInfo } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { users } from '../infra/db/schemas.js'

export async function createUser({uudi, login, name, role, hash, salt}){

	try {

		const result = await db.insert(users).values({ id: uudi, login, name, role, password: `${hash}:${salt}` }).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error creating user: ${error.message}`,error);
		throw error;
	}

}

export async function getPasswordByLogin(login){

	try {

		const result = await db.select({password: users.password}).from(users).where(eq(users.login, login))
		return result[0].password
		
	} catch (error) {
		logError(`Error creating user: ${error.message}`,error);
		throw error;
	}	
}