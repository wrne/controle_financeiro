import { db } from '../infra/db/database-connection.js'
import { logError, logInfo } from '../utils/logger.js';
import { eq } from 'drizzle-orm';
import { periods } from '../infra/db/schemas.js';

export async function getAllPeriodsRepo(){

	try {

		// const result = db.insert(user).values({ id: uudi, login, name, password: `${hash}:${salt}` }).returning()
		const result = await db.select().from(periods)
		return result
		
	} catch (error) {
		logError(`Error listing periods: ${error.message}`,error);
		throw error;
	}

}

export async function getPeriodByIdRepo(id){

	try {

		// const result = db.insert(user).values({ id: uudi, login, name, password: `${hash}:${salt}` }).returning()
		const result = await db.select().from(periods).where(eq(periods.id, id))
		return result[0]
		
	} catch (error) {
		logError(`Error fetching period: ${error.message}`,error);
		throw error;
	}

}

export async function createPeriodRepo({ description, account, initialDate, finalDate}){

	try {

		const result = await db.insert(periods).values({ description, account, initialDate, finalDate }).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error creating period: ${error.message}`,error);
		throw error;
	}

}

export async function deletePeriodRepo(id){

	try {

		const result = await db.delete(periods).where(eq(periods.id, id)).returning()
		return result[0]
		
	} catch (error) {
		logError(`Error deleting period: ${error.message}`,error);
		throw error;
	}

}