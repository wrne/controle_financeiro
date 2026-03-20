import { logInfo } from "../utils/logger.js"
import { getAllBudget, getBudget, createBudget, updateBudget, deleteBudget } from "../services/budget-services.js"

export async function getAllBudgetController(req, res) {

	try {
		const budgetList = await getAllBudget(req.query)
		logInfo(`budget list retrieved successful`)

		res.success(budgetList, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting budget')
	}

}

export async function getBudgetController(req, res) {

	try {
		const budget = await getBudget(req.params.id)
		logInfo(`budget retrieved successful`)

		res.success(budget, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting budget')
	}

}


export async function createBudgetController(req, res) {

	try {
		const budget = await createBudget(req.body)
		logInfo(`budget created successful`)

		res.success(budget, 'budget created successful.')


	} catch (error) {
		res.error(400, error, 'Failure on creating budget')
	}

}


export async function updateBudgetController(req, res) {

	try {
		const budget = await updateBudget(req.params.id, req.body)
		logInfo(`budget updated successful`)

		res.success(budget, 'budget updated successful.')


	} catch (error) {
		res.error(400, error, 'Failure on updating budget')
	}

}


export async function deleteBudgetController(req, res) {

	try {
		const budget = await deleteBudget(req.params.id)
		logInfo(`budget deleted successful`)

		res.success(budget, 'budget deleted successful.')


	} catch (error) {
		res.error(400, error, 'Failure on deleting budget')
	}

}
