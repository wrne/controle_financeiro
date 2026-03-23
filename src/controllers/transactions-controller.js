import { logInfo } from "../utils/logger.js"
import {
	getAllTransactions,
	getTransaction,
	createTransaction,
	updateTransaction,
	deleteTransaction
} from "../services/transactions-services.js"

export async function getAllTransactionsController(req, res) {

	try {
		const transactionsList = await getAllTransactions(req.query)
		logInfo(`transactions list retrieved successful`)

		res.success(transactionsList, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting transactions')
	}

}

export async function getTransactionController(req, res) {

	try {
		const transaction = await getTransaction(req.params.id)
		logInfo(`transaction retrieved successful`)

		res.success(transaction, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting transaction')
	}

}


export async function createTransactionController(req, res) {

	try {
		const transaction = await createTransaction(req.body)
		logInfo(`transaction created successful`)

		res.success(transaction, 'transaction created successful.')


	} catch (error) {
		res.error(400, error, 'Failure on creating transaction')
	}

}


export async function updateTransactionController(req, res) {

	try {
		const transaction = await updateTransaction(req.params.id, req.body)
		logInfo(`transaction updated successful`)

		res.success(transaction, 'transaction updated successful.')


	} catch (error) {
		res.error(400, error, 'Failure on updating transaction')
	}

}


export async function deleteTransactionController(req, res) {

	try {
		const transaction = await deleteTransaction(req.params.id)
		logInfo(`transaction deleted successful`)

		res.success(transaction, 'transaction deleted successful.')


	} catch (error) {
		res.error(400, error, 'Failure on deleting transaction')
	}

}
