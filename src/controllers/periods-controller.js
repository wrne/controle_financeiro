import { logInfo } from "../utils/logger.js"
import { getAllPeriods, getPeriod, createPeriod, updatePeriod, deletePeriod } from "../services/periods-services.js"

export async function getAllPeriodsController(req, res) {

	try {
		const periodsList = await getAllPeriods(req.query)
		logInfo(`periods List retrieved successful`)

		res.success(periodsList, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting periods')
	}

}

export async function getPeriodController(req, res) {

	try {
		const period = await getPeriod(req.params.id)
		logInfo(`period retrieved successful`)

		res.success(period, 'consult proceed successful.')


	} catch (error) {
		res.error(400, error, 'Failure on getting periods')
	}

}


export async function createPeriodController(req, res) {

	try {
		const period = await createPeriod(req.body)
		logInfo(`period created successful`)

		res.success(period, 'period created successful.')


	} catch (error) {
		res.error(400, error, 'Failure on creating periods')
	}

}


export async function updatePeriodController(req, res) {

	try {
		const period = await updatePeriod(req.params.id, req.body)
		logInfo(`period updated successful`)

		res.success(period, 'period updated successful.')


	} catch (error) {
		res.error(400, error, 'Failure on updating periods')
	}

}


export async function deletePeriodController(req, res) {

	try {
		const period = await deletePeriod(req.params.id)
		logInfo(`period deleted successful`)

		res.success(period, 'period deleted successful.')


	} catch (error) {
		res.error(400, error, 'Failure on deleting periods')
	}

}