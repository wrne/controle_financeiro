import { getYearDataRepo } from '../../budget/repositories/budget-repository.js'
import { computeResults } from '../results-calc.js'

/** Resultado orçado do ano (Entrega 1: só orçado). */
export async function getResults(year) {
	const data = await getYearDataRepo(year)
	return { year, source: 'BUDGET', ...computeResults(data) }
}
