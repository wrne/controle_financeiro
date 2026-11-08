'use server'

import { api } from '@/lib/api'
import { runAction, assertUuid, assertInt } from '@/lib/action-result'

const MAX_CENTS = 9_999_999_999_999

/** Grava o orçado de uma categoria num mês (null remove). */
export async function saveBudgetCell(year, month, categoryId, amountCents) {
	return runAction(() => {
		assertInt(year, 2000, 2100)
		assertInt(month, 1, 12)
		if (amountCents !== null) assertInt(amountCents, 0, MAX_CENTS)
		return api(`/budget/${year}/${month}/categories/${assertUuid(categoryId)}`, { method: 'PUT', body: { amountCents } })
	})
}

/** Grava o comentário de uma célula (vazio remove). */
export async function saveBudgetNote(year, month, categoryId, note) {
	return runAction(() => {
		assertInt(year, 2000, 2100)
		assertInt(month, 1, 12)
		const text = typeof note === 'string' ? note.trim() : ''
		if (text.length > 500) throw new Error('Validation failed')
		return api(`/budget/${year}/${month}/categories/${assertUuid(categoryId)}/note`, { method: 'PUT', body: { note: text || null } })
	})
}

/** Copia o valor de fromMonth para os meses seguintes. Devolve os 12 meses da categoria. */
export async function replicateBudget(year, categoryId, fromMonth) {
	return runAction(() => {
		assertInt(year, 2000, 2100)
		assertInt(fromMonth, 1, 11)
		return api(`/budget/${year}/replicate`, { method: 'POST', body: { categoryId: assertUuid(categoryId), fromMonth } })
	})
}
