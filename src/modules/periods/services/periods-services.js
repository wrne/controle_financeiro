import { AppError } from '../../../utils/app-error.js'
import { todayIso } from '../../../utils/date-utils.js'
import { assertReferences } from '../../../infra/repositories/ownership-repository.js'
import { getAllPeriodsRepo, getPeriodByIdRepo, createPeriodRepo, updatePeriodRepo, deletePeriodRepo } from '../repositories/periods-repository.js';

function assertDateOrder(initialDate, finalDate) {
	if (initialDate && finalDate && finalDate < initialDate) {
		throw new AppError(400, 'finalDate must be on or after initialDate')
	}
}

export async function getAllPeriods(filters) {
	return await getAllPeriodsRepo(filters)
}

export async function getPeriod(id) {
	const row = await getPeriodByIdRepo(id)
	if (!row) throw new AppError(404, 'period not found')
	return row
}

export async function createPeriod({ description = 'NEW_PERIOD', account, initialDate = todayIso(), finalDate }) {
	await assertReferences({ account })
	assertDateOrder(initialDate, finalDate)

	return await createPeriodRepo({ description, account, initialDate, finalDate })
}

export async function updatePeriod(id, data) {
	const current = await getPeriod(id)

	// Trocar a conta de um período que já tem conta quebraria orçamentos e lançamentos já vinculados
	if (data.account !== undefined && current.account && data.account !== current.account) {
		throw new AppError(400, 'period account cannot be changed')
	}

	const merged = { ...current, ...data }
	await assertReferences({ account: merged.account })
	assertDateOrder(merged.initialDate, merged.finalDate)

	return await updatePeriodRepo(id, data)
}

export async function deletePeriod(id) {
	const row = await deletePeriodRepo(id)
	if (!row) throw new AppError(404, 'period not found')
	return row
}
