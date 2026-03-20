import { db } from '../infra/db/database-connection.js'
import { getStorage } from '../utils/context-utils.js';

export async function withUser(data){

	const {userId} = await getStorage();
	return { ...data, userId }

}

export async function insert(table, data){
	const dataWithUser = await withUser(data);
	return await db.insert(table).values(dataWithUser).returning();
}

export async function applyUserFilter(condition) {

	const {userId} = await getStorage();
    return condition
      ? and(condition, eq(this.userId, userId))
      : eq(this.userId, userId)
  }