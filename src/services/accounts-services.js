import { logInfo } from '../utils/logger.js';
import { getAllAccountsRepo, getAccountByIdRepo, createAccountRepo, deleteAccountRepo } from '../repositories/accounts-repository.js';

export async function getAllAccounts(filtersParam) {
	return await getAllAccountsRepo(filtersParam)
}

export async function getAccount(id) {
	return await getAccountByIdRepo(id)

}

export async function createAccount({ name = 'NEW_ACCOUNT', type = 1 }) {

	return await createAccountRepo(name, type)

}

export async function updateAccount() {

}

export async function deleteAccount(id) {

	return await deleteAccountRepo(id)

} 
