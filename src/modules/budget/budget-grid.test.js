import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildBudgetGrid, replicateFrom, emptyMonths } from './budget-grid.js'

const groups = [
	{ id: 'g-desp', name: 'Moradia', kind: 'DESPESA', resultClass: 'BASICO', sortOrder: 2 },
	{ id: 'g-rec', name: 'Receitas', kind: 'RECEITA', resultClass: null, sortOrder: 1 },
	{ id: 'g-old', name: 'Antigo', kind: 'DESPESA', resultClass: 'BASICO', sortOrder: 3, archivedAt: new Date() }
]
const categories = [
	{ id: 'c-luz', groupId: 'g-desp', name: 'Luz', sortOrder: 2 },
	{ id: 'c-aluguel', groupId: 'g-desp', name: 'Aluguel', sortOrder: 1 },
	{ id: 'c-arq', groupId: 'g-desp', name: 'Arquivada', sortOrder: 3, archivedAt: new Date() },
	{ id: 'c-arq-valor', groupId: 'g-desp', name: 'Arquivada com valor', sortOrder: 4, archivedAt: new Date() },
	{ id: 'c-pag', groupId: 'g-rec', name: 'Pagamento', sortOrder: 1 },
	{ id: 'c-old', groupId: 'g-old', name: 'Velha', sortOrder: 1 }
]
const items = [
	{ categoryId: 'c-aluguel', month: 1, amountCents: 185000 },
	{ categoryId: 'c-aluguel', month: 2, amountCents: 185000 },
	{ categoryId: 'c-luz', month: 1, amountCents: 10050 },
	{ categoryId: 'c-arq-valor', month: 12, amountCents: 1 },
	{ categoryId: 'c-pag', month: 1, amountCents: 1980000 }
]

test('grade: ordem, meses, subtotais e totais', () => {
	const grid = buildBudgetGrid({ year: 2026, groups, categories, items })

	assert.deepEqual(grid.groups.map((g) => g.name), ['Receitas', 'Moradia'])
	const moradia = grid.groups[1]
	assert.deepEqual(moradia.categories.map((c) => c.name), ['Aluguel', 'Luz', 'Arquivada com valor'])
	assert.deepEqual(moradia.categories[0].months, [185000, 185000, null, null, null, null, null, null, null, null, null, null])
	assert.equal(moradia.categories[0].totalCents, 370000)
	assert.equal(moradia.monthTotalsCents[0], 195050)
	assert.equal(moradia.monthTotalsCents[11], 1)
	assert.equal(moradia.totalCents, 380051)

	assert.equal(grid.totals.revenue.totalCents, 1980000)
	assert.equal(grid.totals.expense.totalCents, 380051)
	assert.equal(grid.totals.balance.monthTotalsCents[0], 1980000 - 195050)
	assert.equal(grid.totals.balance.monthTotalsCents[1], -185000)
	assert.equal(grid.totals.balance.totalCents, 1980000 - 380051)
})

test('grade: arquivados sem valor só aparecem com includeArchived', () => {
	const grid = buildBudgetGrid({ year: 2026, groups, categories, items, includeArchived: true })
	assert.deepEqual(grid.groups.map((g) => g.name), ['Receitas', 'Moradia', 'Antigo'])
	assert.ok(grid.groups[1].categories.some((c) => c.name === 'Arquivada' && c.archived))
})

test('grade vazia', () => {
	const grid = buildBudgetGrid({ year: 2026, groups: [], categories: [], items: [] })
	assert.deepEqual(grid.groups, [])
	assert.equal(grid.totals.balance.totalCents, 0)
	assert.equal(grid.totals.balance.monthTotalsCents.length, 12)
})

test('replicar: copia o valor do mês para os seguintes', () => {
	const months = emptyMonths()
	months[0] = 100
	months[3] = 500
	months[6] = 700
	assert.deepEqual(replicateFrom(months, 4), [100, null, null, 500, 500, 500, 500, 500, 500, 500, 500, 500])
	assert.deepEqual(months[6], 700, 'não altera o array original')
	assert.deepEqual(replicateFrom(months, 12), months)
})

test('replicar: mês vazio limpa os seguintes', () => {
	const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
	months[9] = null
	assert.deepEqual(replicateFrom(months, 10), [1, 2, 3, 4, 5, 6, 7, 8, 9, null, null, null])
})

test('replicar: mês inválido', () => {
	assert.throws(() => replicateFrom(emptyMonths(), 0))
	assert.throws(() => replicateFrom(emptyMonths(), 13))
	assert.throws(() => replicateFrom([1, 2], 1))
})

test('grade: comentários por célula, independentes do valor', () => {
	const notes = [
		{ categoryId: 'c-luz', month: 3, note: 'Confirmar tarifa nova' },
		{ categoryId: 'c-aluguel', month: 1, note: 'Reajuste em abril' },
		{ categoryId: 'c-arq', month: 5, note: 'Comentário em arquivada sem valor' }
	]
	const grid = buildBudgetGrid({ year: 2026, groups, categories, items, notes })
	const moradia = grid.groups.find((g) => g.name === 'Moradia')
	const luz = moradia.categories.find((c) => c.name === 'Luz')
	assert.equal(luz.notes[2], 'Confirmar tarifa nova', 'comentário em célula sem valor')
	assert.equal(luz.months[2], null)
	assert.equal(moradia.categories.find((c) => c.name === 'Aluguel').notes[0], 'Reajuste em abril')
	assert.equal(luz.notes.length, 12)
	assert.equal(luz.notes.filter(Boolean).length, 1)
	assert.ok(!moradia.categories.some((c) => c.name === 'Arquivada'), 'comentário não faz arquivada sem valor aparecer')
	assert.deepEqual(buildBudgetGrid({ year: 2026, groups, categories, items }).groups[1].categories[0].notes, emptyMonths(), 'sem comentários = 12 nulls')
})
