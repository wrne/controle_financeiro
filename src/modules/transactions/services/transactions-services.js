import { AppError } from '../../../utils/app-error.js'
import { assertReferences } from '../../../infra/repositories/ownership-repository.js'
import { getAllTransactionsRepo, getTransactionByIdRepo, createTransactionRepo, updateTransactionRepo, deleteTransactionRepo } from '../repositories/transactions-repository.js';

export async function getAllTransactions(filters) {
	return await getAllTransactionsRepo(filters)
}

export async function getTransaction(id) {
	const row = await getTransactionByIdRepo(id)
	if (!row) throw new AppError(404, 'transaction not found')
	return row
}

export async function createTransaction({ date, amount, account, category, period }) {
	await assertReferences({ account, category, period })

	return await createTransactionRepo({ date, amount, account, category, period })
}

export async function updateTransaction(id, data) {
	const current = await getTransaction(id)

	const merged = { ...current, ...data }
	await assertReferences({ account: merged.account, category: merged.category, period: merged.period })

	return await updateTransactionRepo(id, data)
}

export async function deleteTransaction(id) {
	const row = await deleteTransactionRepo(id)
	if (!row) throw new AppError(404, 'transaction not found')
	return row
}
