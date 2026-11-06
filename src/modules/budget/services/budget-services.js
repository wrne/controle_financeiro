import { getAllBudgetRepo, getBudgetByIdRepo, createBudgetRepo, deleteBudgetRepo } from '../repositories/budget-repository.js';

export async function getAllBudget(filtersParam) {
	return await getAllBudgetRepo(filtersParam)
}

export async function getBudget(id) {
	return await getBudgetByIdRepo(id)

}

export async function createBudget(data) {
	const { amount = '0', category, account, period } = data

	return await createBudgetRepo({ amount, category, account, period })

}

export async function updateBudget() {

}

export async function deleteBudget(id) {

	return await deleteBudgetRepo(id)

}
