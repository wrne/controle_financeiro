import { accounts, categories, categoryGroups, periods } from '../db/schemas.js'
import { findById } from './_base-repository.js'
import { AppError } from '../../utils/app-error.js'

/**
 * Garante que conta, categoria e período informados existem E pertencem ao usuário logado,
 * e que o período pertence à conta informada (quando o período está vinculado a uma conta).
 * A mensagem é a mesma para "não existe" e "é de outro usuário", para não revelar ids alheios.
 * @param {{account?: string|null, category?: string|null, period?: string|null, group?: string|null}} refs
 * @returns {Promise<{ category?: object, group?: object }>} os registros de categoria e grupo encontrados
 */
export async function assertReferences({ account, category, period, group }) {

	const found = {}

	if (account) {
		if (!(await findById(accounts, account))) throw new AppError(400, 'account not found')
	}

	if (category) {
		found.category = await findById(categories, category)
		if (!found.category) throw new AppError(400, 'category not found')
	}

	if (group) {
		found.group = await findById(categoryGroups, group)
		if (!found.group) throw new AppError(400, 'group not found')
	}

	if (period) {
		const periodRow = await findById(periods, period)
		if (!periodRow) throw new AppError(400, 'period not found')

		if (account && periodRow.account && periodRow.account !== account) {
			throw new AppError(400, 'period does not belong to the given account')
		}
	}

	return found
}
