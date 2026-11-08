// Monta e valida o plano de carga inicial (grupos, categorias e orçado de um ano) a partir dos arquivos
// extraídos da planilha (dados/categorias-iniciais.json e dados/orcamento-AAAA.json). Função pura.

const KINDS = ['RECEITA', 'DESPESA']
const RESULT_CLASSES = ['TRABALHO', 'BASICO', 'INVESTIMENTO']
const MAX_CENTS = 9_999_999_999_999

const key = (group, category) => `${group}\u0000${category}`

/**
 * @param {{ grupos: { nome: string, kind: string, classificacao: string|null, categorias: string[] }[] }} categoriesFile
 * @param {{ year: number, items: { group: string, category: string, month: number, amountCents: number }[], checks?: { group: string, month: number, totalCents: number }[] } | null} budgetFile
 * @returns {{ groups: object[], year: number|null, items: object[] }}
 * @throws {Error} com todos os problemas encontrados
 */
export function buildSeedPlan(categoriesFile, budgetFile = null) {
	const errors = []
	const groups = []
	const known = new Set()
	const groupNames = new Set()

	;(categoriesFile?.grupos ?? []).forEach((g, gi) => {
		if (!g?.nome || typeof g.nome !== 'string' || g.nome.length > 40) errors.push(`grupo ${gi + 1}: nome inválido`)
		if (groupNames.has(g.nome)) errors.push(`grupo "${g.nome}" repetido`)
		groupNames.add(g.nome)
		if (!KINDS.includes(g.kind)) errors.push(`grupo "${g.nome}": kind inválido (${g.kind})`)
		if (g.kind === 'RECEITA' && g.classificacao) errors.push(`grupo "${g.nome}": receita não tem classificação`)
		if (g.kind === 'DESPESA' && !RESULT_CLASSES.includes(g.classificacao)) errors.push(`grupo "${g.nome}": classificação inválida (${g.classificacao})`)

		const names = new Set()
		const cats = (g.categorias ?? []).map((name, ci) => {
			if (!name || typeof name !== 'string' || name.length > 40) errors.push(`grupo "${g.nome}", categoria ${ci + 1}: nome inválido`)
			if (names.has(name)) errors.push(`grupo "${g.nome}": categoria "${name}" repetida`)
			names.add(name)
			known.add(key(g.nome, name))
			return { name, sortOrder: ci + 1 }
		})
		groups.push({ name: g.nome, kind: g.kind, resultClass: g.kind === 'RECEITA' ? null : g.classificacao, sortOrder: gi + 1, categories: cats })
	})
	if (!groups.length) errors.push('nenhum grupo no arquivo de categorias')

	let year = null
	const items = []
	if (budgetFile) {
		year = budgetFile.year
		if (!Number.isInteger(year) || year < 2000 || year > 2100) errors.push(`ano inválido (${year})`)

		const seen = new Set()
		const totals = new Map()
		;(budgetFile.items ?? []).forEach((it, i) => {
			const where = `item ${i + 1} (${it.group} / ${it.category}, mês ${it.month})`
			if (!known.has(key(it.group, it.category))) errors.push(`${where}: categoria não existe na lista`)
			if (!Number.isInteger(it.month) || it.month < 1 || it.month > 12) errors.push(`${where}: mês inválido`)
			if (!Number.isInteger(it.amountCents) || it.amountCents < 0 || it.amountCents > MAX_CENTS) errors.push(`${where}: valor em centavos inválido`)
			const k = `${key(it.group, it.category)}\u0000${it.month}`
			if (seen.has(k)) errors.push(`${where}: repetido`)
			seen.add(k)
			const tk = `${it.group}\u0000${it.month}`
			totals.set(tk, (totals.get(tk) ?? 0) + (it.amountCents ?? 0))
			items.push({ group: it.group, category: it.category, month: it.month, amountCents: it.amountCents })
		})

		// Conferência: soma por grupo e mês = "Total mensal" da planilha
		for (const c of budgetFile.checks ?? []) {
			const got = totals.get(`${c.group}\u0000${c.month}`) ?? 0
			if (got !== c.totalCents) errors.push(`conferência ${c.group}, mês ${c.month}: soma ${got} ≠ planilha ${c.totalCents}`)
		}
	}

	if (errors.length) throw new Error(`Seed plan is invalid:\n- ${errors.join('\n- ')}`)
	return { groups, year, items }
}
