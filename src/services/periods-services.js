import { logInfo } from '../utils/logger.js';
import { getAllPeriodsRepo, getPeriodByIdRepo, createPeriodRepo, deletePeriodRepo } from '../repositories/periods-repository.js';

export async function getAllPeriods(filtersParam) {
	return await getAllPeriodsRepo(filtersParam)
}

export async function getPeriod(id) {
	return await getPeriodByIdRepo(id)

}

export async function createPeriod(data) {
	const { description = 'NEW_PERIOD', account, initialDate = new Date(), finalDate } = data

	return await createPeriodRepo({description, account, initialDate, finalDate })

}

export async function updatePeriod() {

}

export async function deletePeriod(id) {

	return await deletePeriodRepo(id)

} 
