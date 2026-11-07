import { accounts, categories, periods } from '../db/schemas.js'
import { findById } from './_base-repository.js'
import { AppError } from '../../utils/app-error.js'

/**
 * Garante que conta, categoria e período informados existem E pertencem ao usuário logado,
 * e que o período pertence à conta informada (quando o período está vinculado a uma conta).
 * A mensagem é a mesma para "não existe" e "é de outro usuário", para não revelar ids alheios.
 * @param {{account?: string|null, category?: string|null, period?: string|null}} refs
 */
export async function assertReferences({ account, category, period }) {

	if (account) {
		if (!(await findById(accounts, account))) throw new AppError(400, 'account not found')
	}

	if (category) {
		if (!(await findById(categories, category))) throw new AppError(400, 'category not found')
	}

	if (period) {
		const periodRow = await findById(periods, period)
		if (!periodRow) throw new AppError(400, 'period not found')

		if (account && periodRow.account && periodRow.account !== account) {
			throw new AppError(400, 'period does not belong to the given account')
		}
	}
}
