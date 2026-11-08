import { test } from 'node:test'
import assert from 'node:assert/strict'
import { computeResults } from './results-calc.js'

const groups = [
	{ id: 'rec', kind: 'RECEITA', resultClass: null },
	{ id: 'trab', kind: 'DESPESA', resultClass: 'TRABALHO' },
	{ id: 'inv', kind: 'DESPESA', resultClass: 'INVESTIMENTO' },
	{ id: 'bas1', kind: 'DESPESA', resultClass: 'BASICO' },
	{ id: 'bas2', kind: 'DESPESA', resultClass: 'BASICO' }
]
const categories = [
	{ id: 'pagamento', groupId: 'rec' },
	{ id: 'reembolso', groupId: 'rec' },
	{ id: 'imposto', groupId: 'trab' },
	{ id: 'rf', groupId: 'inv' },
	{ id: 'aluguel', groupId: 'bas1' },
	{ id: 'mercado', groupId: 'bas2' },
	{ id: 'orfa', groupId: 'nao-existe' }
]

test('Resultado: linhas da planilha, por mês e no ano', () => {
	const items = [
		{ categoryId: 'pagamento', month: 1, amountCents: 1980000 },
		{ categoryId: 'reembolso', month: 1, amountCents: 30300 },
		{ categoryId: 'imposto', month: 1, amountCents: 181481 },
		{ categoryId: 'rf', month: 1, amountCents: 220000 },
		{ categoryId: 'aluguel', month: 1, amountCents: 185000 },
		{ categoryId: 'mercado', month: 1, amountCents: 80000 },
		{ categoryId: 'pagamento', month: 2, amountCents: 100000 },
		{ categoryId: 'aluguel', month: 2, amountCents: 185000 },
		{ categoryId: 'orfa', month: 2, amountCents: 999 }
	]
	const { months, total } = computeResults({ groups, categories, items })

	assert.equal(months.length, 12)
	assert.deepEqual(months[0], {
		month: 1,
		grossRevenueCents: 2010300,
		workExpensesCents: 181481,
		revenueBeforeInvestmentsCents: 2010300 - 181481,
		investmentsCents: 220000,
		netRevenueCents: 2010300 - 181481 - 220000,
		personalExpensesCents: 265000,
		netResultCents: 2010300 - 181481 - 220000 - 265000
	})
	assert.equal(months[1].netResultCents, -85000, 'resultado negativo (prejuízo)')
	assert.equal(months[2].netResultCents, 0)
	assert.equal(total.grossRevenueCents, 2110300)
	assert.equal(total.personalExpensesCents, 450000)
	assert.equal(total.netResultCents, months.reduce((acc, m) => acc + m.netResultCents, 0))
})

test('Resultado: sem dados', () => {
	const { months, total } = computeResults({ groups: [], categories: [], items: [] })
	assert.equal(months.every((m) => m.netResultCents === 0), true)
	assert.equal(total.netResultCents, 0)
})
