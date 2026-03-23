import {
	getAllTransactionsRepo,
	getTransactionByIdRepo,
	createTransactionRepo,
	deleteTransactionRepo
} from '../repositories/transactions-repository.js';

export async function getAllTransactions(filtersParam) {
	return await getAllTransactionsRepo(filtersParam)
}

export async function getTransaction(id) {
	return await getTransactionByIdRepo(id)

}

export async function createTransaction(data) {
	const { date, amount = '0', account, category, period } = data

	return await createTransactionRepo({ date, amount, account, category, period })

}

export async function updateTransaction() {

}

export async function deleteTransaction(id) {

	return await deleteTransactionRepo(id)

}
