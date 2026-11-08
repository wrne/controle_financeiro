// Montagem da grade de orçamento (categoria × 12 meses) a partir das linhas do banco.
// Funções puras: recebem grupos, categorias e itens já filtrados pelo usuário e pelo ano.

const MONTHS = 12

export function emptyMonths() {
	return Array(MONTHS).fill(null)
}

export function byOrder(a, b) {
	return (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name, 'pt-BR')
}

function sumMonths(rows) {
	const totals = Array(MONTHS).fill(0)
	for (const months of rows) {
		months.forEach((value, i) => { totals[i] += value ?? 0 })
	}
	return totals
}

const sum = (values) => values.reduce((acc, v) => acc + (v ?? 0), 0)

/**
 * Agrupa os itens por categoria: Map<categoryId, (number|null)[12]>.
 * @param {{ categoryId: string, month: number, amountCents: number }[]} items
 */
export function monthsByCategory(items) {
	const map = new Map()
	for (const item of items) {
		if (!map.has(item.categoryId)) map.set(item.categoryId, emptyMonths())
		map.get(item.categoryId)[item.month - 1] = item.amountCents
	}
	return map
}

/**
 * Agrupa os comentários por categoria: Map<categoryId, (string|null)[12]>.
 * @param {{ categoryId: string, month: number, note: string }[]} notes
 */
export function notesByCategory(notes) {
	const map = new Map()
	for (const n of notes) {
		if (!map.has(n.categoryId)) map.set(n.categoryId, emptyMonths())
		map.get(n.categoryId)[n.month - 1] = n.note
	}
	return map
}

/**
 * Grade do ano. Categorias e grupos arquivados só aparecem se tiverem valor no ano
 * (para os totais baterem) ou com includeArchived. Comentários não mudam essa regra.
 */
export function buildBudgetGrid({ year, groups, categories, items, notes = [], includeArchived = false }) {
	const values = monthsByCategory(items)
	const comments = notesByCategory(notes)

	const gridGroups = []
	for (const group of [...groups].sort(byOrder)) {
		const gridCategories = categories
			.filter((c) => c.groupId === group.id)
			.sort(byOrder)
			.map((c) => {
				const months = values.get(c.id) ?? emptyMonths()
				const categoryNotes = comments.get(c.id) ?? emptyMonths()
				return { id: c.id, name: c.name, archived: Boolean(c.archivedAt), months, totalCents: sum(months), notes: categoryNotes }
			})
			.filter((c) => !c.archived || includeArchived || c.months.some((v) => v !== null))

		const groupArchived = Boolean(group.archivedAt)
		const hasValues = gridCategories.some((c) => c.months.some((v) => v !== null))
		if (groupArchived && !includeArchived && !hasValues) continue

		const monthTotalsCents = sumMonths(gridCategories.map((c) => c.months))
		gridGroups.push({
			id: group.id,
			name: group.name,
			kind: group.kind,
			resultClass: group.resultClass ?? null,
			archived: groupArchived,
			categories: gridCategories,
			monthTotalsCents,
			totalCents: sum(monthTotalsCents)
		})
	}

	const kindTotals = (kind) => {
		const monthTotalsCents = sumMonths(gridGroups.filter((g) => g.kind === kind).map((g) => g.monthTotalsCents))
		return { monthTotalsCents, totalCents: sum(monthTotalsCents) }
	}
	const revenue = kindTotals('RECEITA')
	const expense = kindTotals('DESPESA')
	const balanceMonths = revenue.monthTotalsCents.map((v, i) => v - expense.monthTotalsCents[i])

	return {
		year,
		groups: gridGroups,
		totals: {
			revenue,
			expense,
			balance: { monthTotalsCents: balanceMonths, totalCents: sum(balanceMonths) }
		}
	}
}

/**
 * "Replicar para os meses seguintes": o valor de fromMonth passa para todos os meses depois dele, até dezembro.
 * Um mês vazio (null) replicado limpa os seguintes.
 * @param {(number|null)[]} months 12 posições
 * @param {number} fromMonth 1 a 12
 * @returns {(number|null)[]}
 */
export function replicateFrom(months, fromMonth) {
	if (months.length !== MONTHS) throw new Error('months must have 12 positions')
	if (!Number.isInteger(fromMonth) || fromMonth < 1 || fromMonth > MONTHS) throw new Error('invalid month')
	const value = months[fromMonth - 1]
	return months.map((v, i) => (i >= fromMonth ? value : v))
}
