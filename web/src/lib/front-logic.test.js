import { test } from 'node:test'
import assert from 'node:assert/strict'
import { currentYearMonth, parseYear, parseMonth } from './dates.js'
import { recomputeGrid, setCell, setCategoryMonths, setCellNote } from './budget-grid.js'
import { friendlyError } from './api-errors.js'

test('currentYearMonth usa o fuso de São Paulo, não o do servidor', () => {
	// 01/12/2026 01:00 UTC = 30/11/2026 22:00 em São Paulo (UTC-3)
	assert.deepEqual(currentYearMonth(new Date('2026-12-01T01:00:00Z')), { year: 2026, month: 11 })
	// 01/01/2027 02:59 UTC = 31/12/2026 23:59 em São Paulo
	assert.deepEqual(currentYearMonth(new Date('2027-01-01T02:59:00Z')), { year: 2026, month: 12 })
	assert.deepEqual(currentYearMonth(new Date('2027-01-01T03:00:00Z')), { year: 2027, month: 1 })
})

test('parseYear e parseMonth', () => {
	assert.equal(parseYear('2026', 2000), 2026)
	assert.equal(parseYear(undefined, 2026), 2026)
	for (const bad of ['abc', '1999', '2101', '2026.5', '']) assert.equal(parseYear(bad, 2026), 2026)
	assert.equal(parseMonth('3'), 3)
	for (const bad of [undefined, '0', '13', 'x', '1.5']) assert.equal(parseMonth(bad), null)
})

const empty = () => Array(12).fill(null)
function grid() {
	const pag = empty(); pag[0] = 1000000
	const aluguel = empty(); aluguel[0] = 185000; aluguel[1] = 185000
	return recomputeGrid({
		year: 2026,
		groups: [
			{ id: 'r', kind: 'RECEITA', categories: [{ id: 'pag', months: pag }] },
			{ id: 'm', kind: 'DESPESA', categories: [{ id: 'aluguel', months: aluguel }, { id: 'luz', months: empty() }] }
		]
	})
}

test('recomputeGrid: totais de categoria, grupo e saldo', () => {
	const g = grid()
	assert.equal(g.groups[1].categories[0].totalCents, 370000)
	assert.equal(g.groups[1].monthTotalsCents[1], 185000)
	assert.equal(g.totals.revenue.totalCents, 1000000)
	assert.equal(g.totals.expense.totalCents, 370000)
	assert.equal(g.totals.balance.monthTotalsCents[0], 1000000 - 185000)
	assert.equal(g.totals.balance.monthTotalsCents[1], -185000)
	assert.equal(g.totals.balance.totalCents, 630000)
})

test('setCell: grava, remove (null) e não altera o original', () => {
	const g = grid()
	const g2 = setCell(g, 'luz', 1, 10050)
	assert.equal(g2.groups[1].monthTotalsCents[0], 195050)
	assert.equal(g2.totals.balance.monthTotalsCents[0], 1000000 - 195050)
	assert.equal(g.groups[1].monthTotalsCents[0], 185000, 'original intacto')
	const g3 = setCell(g2, 'aluguel', 2, null)
	assert.equal(g3.groups[1].categories[0].months[1], null)
	assert.equal(g3.totals.expense.totalCents, 185000 + 10050)
	assert.equal(setCell(g, 'nao-existe', 1, 1), g)
})

test('setCategoryMonths: troca os 12 meses (replicar)', () => {
	const g = setCategoryMonths(grid(), 'luz', Array(12).fill(100))
	assert.equal(g.groups[1].categories[1].totalCents, 1200)
	assert.equal(g.totals.expense.totalCents, 370000 + 1200)
})

test('friendlyError traduz mensagens conhecidas', () => {
	assert.match(friendlyError({ status: 409, message: 'category is in use (budget or transactions); archive it instead' }), /Arquive/)
	assert.match(friendlyError({ status: 409, message: 'Duplicate record.' }), /Já existe/)
	assert.match(friendlyError({ status: 400, message: 'Validation failed - body.name: Required' }), /Dados inválidos/)
	assert.equal(friendlyError(new TypeError('fetch failed')), 'Não foi possível salvar. Tente de novo.')
	assert.equal(friendlyError(null, 'x'), 'x')
})

test('setCellNote: grava e remove comentário sem mexer nos totais', () => {
	const g = grid()
	const g2 = setCellNote(g, 'luz', 3, 'Tarifa nova')
	const luz = g2.groups[1].categories[1]
	assert.equal(luz.notes[2], 'Tarifa nova')
	assert.equal(luz.notes.length, 12)
	assert.deepEqual(g2.totals, g.totals)
	assert.equal(g.groups[1].categories[1].notes, undefined, 'original intacto')
	assert.equal(setCellNote(g2, 'luz', 3, '').groups[1].categories[1].notes[2], null)
	assert.equal(setCellNote(g2, 'luz', 3, null).groups[1].categories[1].notes[2], null)
})
