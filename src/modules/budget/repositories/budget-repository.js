import { db } from '../../../infra/db/database-connection.js'
import { and, eq, gt } from 'drizzle-orm'
import { budgetItems, budgetNotes, categories, categoryGroups } from '../../../infra/db/schemas.js'
import { applyUserFilter, withUser } from '../../../infra/repositories/_base-repository.js'

const itemColumns = {
	categoryId: budgetItems.categoryId,
	year: budgetItems.year,
	month: budgetItems.month,
	amountCents: budgetItems.amountCents
}

/** Tudo o que a grade e o Resultado precisam para um ano: grupos, categorias (inclusive arquivados) e itens. */
export async function getYearDataRepo(year, { withNotes = false } = {}) {
	const [groups, cats, items, notes] = await Promise.all([
		db.select().from(categoryGroups).where(await applyUserFilter(categoryGroups)),
		db.select().from(categories).where(await applyUserFilter(categories)),
		db.select(itemColumns).from(budgetItems).where(await applyUserFilter(budgetItems, eq(budgetItems.year, year))),
		withNotes
			? db.select({ categoryId: budgetNotes.categoryId, month: budgetNotes.month, note: budgetNotes.note }).from(budgetNotes)
				.where(await applyUserFilter(budgetNotes, eq(budgetNotes.year, year)))
			: []
	])
	return { groups, categories: cats, items, notes }
}

export async function upsertNoteRepo({ categoryId, year, month, note }) {
	const values = await withUser({ categoryId, year, month, note })
	const rows = await db.insert(budgetNotes).values(values)
		.onConflictDoUpdate({
			target: [budgetNotes.userId, budgetNotes.categoryId, budgetNotes.year, budgetNotes.month],
			set: { note, updatedAt: new Date() }
		})
		.returning({ categoryId: budgetNotes.categoryId, year: budgetNotes.year, month: budgetNotes.month, note: budgetNotes.note })
	return rows[0]
}

export async function deleteNoteRepo({ categoryId, year, month }) {
	await db.delete(budgetNotes).where(await applyUserFilter(budgetNotes, and(
		eq(budgetNotes.categoryId, categoryId), eq(budgetNotes.year, year), eq(budgetNotes.month, month)
	)))
}

export async function getCategoryYearItemsRepo(categoryId, year, tx = db) {
	return tx.select(itemColumns).from(budgetItems)
		.where(await applyUserFilter(budgetItems, and(eq(budgetItems.categoryId, categoryId), eq(budgetItems.year, year))))
}

export async function upsertItemRepo({ categoryId, year, month, amountCents }, tx = db) {
	const values = await withUser({ categoryId, year, month, amountCents })
	const rows = await tx.insert(budgetItems).values(values)
		.onConflictDoUpdate({
			target: [budgetItems.userId, budgetItems.categoryId, budgetItems.year, budgetItems.month],
			set: { amountCents, updatedAt: new Date() }
		})
		.returning(itemColumns)
	return rows[0]
}

export async function deleteItemRepo({ categoryId, year, month }, tx = db) {
	await tx.delete(budgetItems).where(await applyUserFilter(budgetItems, and(
		eq(budgetItems.categoryId, categoryId), eq(budgetItems.year, year), eq(budgetItems.month, month)
	)))
}

/** Substitui os meses depois de fromMonth pelos valores dados (null apaga), numa transação. */
export async function replaceMonthsAfterRepo({ categoryId, year, fromMonth, months }) {
	return db.transaction(async (tx) => {
		await tx.delete(budgetItems).where(await applyUserFilter(budgetItems, and(
			eq(budgetItems.categoryId, categoryId), eq(budgetItems.year, year), gt(budgetItems.month, fromMonth)
		)))
		const rows = []
		for (let m = fromMonth + 1; m <= 12; m++) {
			const amountCents = months[m - 1]
			if (amountCents !== null) rows.push(await withUser({ categoryId, year, month: m, amountCents }))
		}
		if (rows.length) await tx.insert(budgetItems).values(rows)
		return getCategoryYearItemsRepo(categoryId, year, tx)
	})
}
