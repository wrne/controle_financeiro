import 'server-only'
import { connection } from 'next/server'
import { currentYearMonth } from './dates.js'

/**
 * Mês atual (São Paulo) calculado na hora da requisição. Com cacheComponents, ler o relógio sem antes
 * esperar a requisição faz o Next tentar pré-renderizar o valor ("blocking-prerender-current-time").
 */
export async function currentYearMonthAtRequest() {
	await connection()
	return currentYearMonth()
}
