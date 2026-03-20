import { logInfo } from "../utils/logger.js"
import { getAllAccounts, getAccount, createAccount, updateAccount, deleteAccount } from "../services/accounts-services.js"

export async function getAllAccountsController(req, res) {

	try {
		const accountsList = await getAllAccounts(req.query)
		logInfo(`accounts List retrieved successful`)

		res.success(accountsList, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting accounts')
	}

}

export async function getAccountController(req, res) {

	try {
		const account = await getAccount(req.params.id)
		logInfo(`account retrieved successful`)

		res.success(account, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting accounts')
	}

}


export async function createAccountController(req, res) {

	try {
		const account = await createAccount(req.body)
		logInfo(`account created successful`)

		res.success(account, 'account created successful.')


	} catch (error) {
		res.error(400, error, 'Failure on creating accounts')
	}

}


export async function updateAccountController(req, res) {

	try {
		const account = await updateAccount(req.params.id, req.body)
		logInfo(`account updated successful`)

		res.success(account, 'account updated successful.')


	} catch (error) {
		res.error(400, error, 'Failure on updating accounts')
	}

}


export async function deleteAccountController(req, res) {

	try {
		const account = await deleteAccount(req.params.id)
		logInfo(`account deleted successful`)

		res.success(account, 'account deleted successful.')


	} catch (error) {
		res.error(400, error, 'Failure on deleting accounts')
	}

}