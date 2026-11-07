import { AppError } from '../../../utils/app-error.js'
import { assertReferences } from '../../../infra/repositories/ownership-repository.js'
import { getAllBudgetRepo, getBudgetByIdRepo, createBudgetRepo, updateBudgetRepo, deleteBudgetRepo } from '../repositories/budget-repository.js';

export async function getAllBudget(filters) {
	return await getAllBudgetRepo(filters)
}

export async function getBudget(id) {
	const row = await getBudgetByIdRepo(id)
	if (!row) throw new AppError(404, 'budget not found')
	return row
}

export async function createBudget({ amount = '0.00', category, account, period }) {
	await assertReferences({ account, category, period })

	return await createBudgetRepo({ amount, category, account, period })
}

export async function updateBudget(id, data) {
	const current = await getBudget(id)

	const merged = { ...current, ...data }
	await assertReferences({ account: merged.account, category: merged.category, period: merged.period })

	return await updateBudgetRepo(id, data)
}

export async function deleteBudget(id) {
	const row = await deleteBudgetRepo(id)
	if (!row) throw new AppError(404, 'budget not found')
	return row
}
