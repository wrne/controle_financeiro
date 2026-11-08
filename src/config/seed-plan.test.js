import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildSeedPlan } from './seed-plan.js'

const categoriesFile = {
	grupos: [
		{ nome: 'Receitas', kind: 'RECEITA', classificacao: null, categorias: ['Pagamento', 'Outros'] },
		{ nome: 'Dia a dia', kind: 'DESPESA', classificacao: 'BASICO', categorias: ['Mercado', 'Outros'] }
	]
}
const budgetFile = {
	year: 2026,
	items: [
		{ group: 'Receitas', category: 'Pagamento', month: 1, amountCents: 1980000 },
		{ group: 'Dia a dia', category: 'Mercado', month: 1, amountCents: 80000 },
		{ group: 'Dia a dia', category: 'Outros', month: 1, amountCents: 120000 }
	],
	checks: [
		{ group: 'Receitas', month: 1, totalCents: 1980000 },
		{ group: 'Dia a dia', month: 1, totalCents: 200000 },
		{ group: 'Dia a dia', month: 2, totalCents: 0 }
	]
}

test('plano: grupos e categorias na ordem do arquivo, "Outros" em dois grupos', () => {
	const plan = buildSeedPlan(categoriesFile, budgetFile)
	assert.deepEqual(plan.groups.map((g) => [g.name, g.sortOrder, g.resultClass]), [['Receitas', 1, null], ['Dia a dia', 2, 'BASICO']])
	assert.deepEqual(plan.groups[1].categories, [{ name: 'Mercado', sortOrder: 1 }, { name: 'Outros', sortOrder: 2 }])
	assert.equal(plan.year, 2026)
	assert.equal(plan.items.length, 3)
})

test('plano: só categorias, sem orçado', () => {
	const plan = buildSeedPlan(categoriesFile)
	assert.equal(plan.year, null)
	assert.deepEqual(plan.items, [])
})

test('plano: conferência de total que não bate é erro', () => {
	const bad = { ...budgetFile, checks: [{ group: 'Dia a dia', month: 1, totalCents: 199999 }] }
	assert.throws(() => buildSeedPlan(categoriesFile, bad), /conferência Dia a dia, mês 1: soma 200000 ≠ planilha 199999/)
})

test('plano: rejeita categoria desconhecida, mês, centavos e repetição', () => {
	const bad = {
		year: 2026,
		items: [
			{ group: 'Dia a dia', category: 'Inexistente', month: 1, amountCents: 1 },
			{ group: 'Receitas', category: 'Outros', month: 13, amountCents: 1 },
			{ group: 'Receitas', category: 'Pagamento', month: 1, amountCents: 10.5 },
			{ group: 'Receitas', category: 'Pagamento', month: 2, amountCents: -1 },
			{ group: 'Dia a dia', category: 'Mercado', month: 3, amountCents: 1 },
			{ group: 'Dia a dia', category: 'Mercado', month: 3, amountCents: 2 }
		]
	}
	try {
		buildSeedPlan(categoriesFile, bad)
		assert.fail('deveria falhar')
	} catch (error) {
		assert.match(error.message, /categoria não existe/)
		assert.match(error.message, /mês inválido/)
		assert.match(error.message, /valor em centavos inválido/)
		assert.match(error.message, /repetido/)
		assert.equal(error.message.split('\n- ').length - 1, 5)
	}
})

test('plano: rejeita grupos inválidos', () => {
	assert.throws(() => buildSeedPlan({ grupos: [] }), /nenhum grupo/)
	assert.throws(() => buildSeedPlan({ grupos: [{ nome: 'X', kind: 'DESPESA', classificacao: null, categorias: [] }] }), /classificação inválida/)
	assert.throws(() => buildSeedPlan({ grupos: [{ nome: 'X', kind: 'RECEITA', classificacao: 'BASICO', categorias: [] }] }), /receita não tem classificação/)
	assert.throws(() => buildSeedPlan({ grupos: [{ nome: 'X', kind: 'OUTRO', categorias: [] }] }), /kind inválido/)
	assert.throws(() => buildSeedPlan({ grupos: [{ nome: 'X', kind: 'RECEITA', categorias: ['A', 'A'] }] }), /repetida/)
})

test('plano: arquivos reais em dados/ (se existirem) são válidos', async (t) => {
	const fs = await import('node:fs')
	const cat = new URL('../../dados/categorias-iniciais.json', import.meta.url)
	const orc = new URL('../../dados/orcamento-2026.json', import.meta.url)
	if (!fs.existsSync(cat) || !fs.existsSync(orc)) return t.skip('dados/ não disponível (fora do git)')
	const plan = buildSeedPlan(JSON.parse(fs.readFileSync(cat)), JSON.parse(fs.readFileSync(orc)))
	assert.equal(plan.groups.length, 6)
	assert.equal(plan.groups.reduce((n, g) => n + g.categories.length, 0), 49)
	assert.equal(plan.year, 2026)
})
