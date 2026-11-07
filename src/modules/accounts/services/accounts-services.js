import { AppError } from '../../../utils/app-error.js'
import { getAllAccountsRepo, getAccountByIdRepo, createAccountRepo, updateAccountRepo, deleteAccountRepo } from '../repositories/accounts-repository.js';

export async function getAllAccounts(filters) {
	return await getAllAccountsRepo(filters)
}

export async function getAccount(id) {
	const row = await getAccountByIdRepo(id)
	if (!row) throw new AppError(404, 'account not found')
	return row
}

export async function createAccount({ name, type = 1 }) {
	return await createAccountRepo({ name, type })
}

export async function updateAccount(id, data) {
	const row = await updateAccountRepo(id, data)
	if (!row) throw new AppError(404, 'account not found')
	return row
}

export async function deleteAccount(id) {
	const row = await deleteAccountRepo(id)
	if (!row) throw new AppError(404, 'account not found')
	return row
}
