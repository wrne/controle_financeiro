import { db } from '../db/database-connection.js'
import { and, eq } from 'drizzle-orm';
import { getStorage } from '../../utils/context-utils.js';

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

/**
 * Busca um registro pelo id, apenas se pertencer ao usuário logado.
 */
export async function findById(table, id) {
	const rows = await db.select().from(table).where(await applyUserFilter(table, eq(table.id, id)))
	return rows[0]
}

/**
 * Atualiza um registro do usuário logado. Retorna o registro atualizado ou undefined se não existir.
 */
export async function updateById(table, id, data) {
	const rows = await db.update(table)
		.set({ ...data, updatedAt: new Date() })
		.where(await applyUserFilter(table, eq(table.id, id)))
		.returning()
	return rows[0]
}
