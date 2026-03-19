import { db } from '../infra/db/database-connection.js'
import { logError, logInfo } from '../utils/logger.js';
import { eq } from 'drizzle-orm';

export function createUser({uudi, login, name, hash, salt}){

	try {

		const result = db.insert(user).values({ id: uudi, login, name, password: `${hash}:${salt}` }).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error creating user: ${error.message}`);
		throw error;
	}

}