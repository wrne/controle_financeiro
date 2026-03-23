import { db } from '../infra/db/database-connection.js'
import { and, eq } from 'drizzle-orm';
import { getStorage } from '../utils/context-utils.js';

export async function withUser(data){

	const {userId} = await getStorage();
	return { ...data, userId }

}

export async function insert(table, data){
	const dataWithUser = await withUser(data);
	return await db.insert(table).values(dataWithUser).returning();
}

export async function applyUserFilter(table, condition = null) {

	const {userId} = await getStorage();
	return condition
		? and(condition, eq(table.userId, userId))
		: eq(table.userId, userId)
}
