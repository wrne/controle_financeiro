import { logInfo } from '../../../utils/logger.js'
import { getBudgetGrid, setBudgetItem, setBudgetNote, replicateBudget } from '../services/budget-services.js'

export async function getBudgetGridController(req, res) {
	try {
		res.success(await getBudgetGrid(req.params.year, req.query), 'consult proceed successful.')
	} catch (error) {
		res.error(400, error, 'Failure on getting budget')
	}
}

export async function setBudgetItemController(req, res) {
	try {
		const item = await setBudgetItem(req.params, req.body)
		logInfo(`budget item saved successful`)
		res.success(item, 'budget item saved successful.')
	} catch (error) {
		res.error(400, error, 'Failure on saving budget item')
	}
}

export async function setBudgetNoteController(req, res) {
	try {
		const note = await setBudgetNote(req.params, req.body)
		logInfo(`budget note saved successful`)
		res.success(note, 'budget note saved successful.')
	} catch (error) {
		res.error(400, error, 'Failure on saving budget note')
	}
}

export async function replicateBudgetController(req, res) {
	try {
		const result = await replicateBudget(req.params.year, req.body)
		logInfo(`budget replicated successful`)
		res.success(result, 'budget replicated successful.')
	} catch (error) {
		res.error(400, error, 'Failure on replicating budget')
	}
}
