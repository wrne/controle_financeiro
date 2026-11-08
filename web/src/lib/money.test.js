import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseBRL, formatCents, formatBRL } from './money.js'

test('parseBRL: formatos válidos em pt-BR', () => {
	const cases = {
		'1.234,56': 123456,
		'1234,56': 123456,
		'1234': 123400,
		'1.234': 123400,
		'1.234.567,89': 123456789,
		'0,5': 50,
		'0,05': 5,
		',50': 50,
		'10,': 1000,
		'R$ 10,00': 1000,
		'R$ 1.234,56': 123456,
		'  42  ': 4200,
		'-10,50': -1050,
		'-R$ 10,50': -1050,
		'12.5': 1250,
		'1234.56': 123456,
		'0': 0,
		'-0': 0,
		'0,00': 0
	}
	for (const [input, expected] of Object.entries(cases)) {
		assert.equal(parseBRL(input), expected, `parseBRL(${JSON.stringify(input)})`)
	}
})

test('parseBRL: entradas inválidas viram null', () => {
	const invalid = ['', '   ', 'abc', '10,5,0', '1,234', '1.23,4', '12.34.5', '1.2345', '--10', '10-', 'R$', ',', '-', '1e3', '0x10', '1 234,56,']
	for (const input of invalid) {
		assert.equal(parseBRL(input), null, `parseBRL(${JSON.stringify(input)})`)
	}
	assert.equal(parseBRL(null), null)
	assert.equal(parseBRL(undefined), null)
	assert.equal(parseBRL(1234), null)
})

test('parseBRL: não usa ponto flutuante (valores que erram com float)', () => {
	assert.equal(parseBRL('0,29'), 29) // 0.29 * 100 = 28.999999999999996
	assert.equal(parseBRL('1,15'), 115) // 1.15 * 100 = 114.99999999999999
	assert.equal(parseBRL('4,35'), 435)
})

test('parseBRL: rejeita valores acima do limite', () => {
	assert.equal(parseBRL('99.999.999.999,99'), 9999999999999)
	assert.equal(parseBRL('100.000.000.000,00'), null)
	assert.equal(parseBRL('99999999999999999999'), null)
})

test('formatCents e formatBRL', () => {
	assert.equal(formatCents(123456), '1.234,56')
	assert.equal(formatCents(5), '0,05')
	assert.equal(formatCents(0), '0,00')
	assert.equal(formatCents(100000000), '1.000.000,00')
	assert.equal(formatCents(-1050), '-10,50')
	assert.equal(formatBRL(123456), 'R$ 1.234,56')
	assert.equal(formatBRL(-1050), '-R$ 10,50')
	assert.equal(formatBRL(0), 'R$ 0,00')
	assert.equal(formatBRL(1.5), '')
	assert.equal(formatBRL('100'), '')
})

test('ida e volta: formatCents → parseBRL', () => {
	for (const cents of [0, 1, 99, 100, 123456, 9999999999999, -1, -123456]) {
		assert.equal(parseBRL(formatCents(cents)), cents)
		assert.equal(parseBRL(formatBRL(cents)), cents)
	}
})
