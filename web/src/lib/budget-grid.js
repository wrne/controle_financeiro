// Atualização local da grade de orçamento (resposta de GET /budget/:year) depois de gravar um valor,
// para a tela não precisar recarregar a grade inteira. Mesma regra de soma do backend.

const sum = (values) => values.reduce((acc, v) => acc + (v ?? 0), 0)

function sumMonths(rows) {
	const totals = Array(12).fill(0)
	for (const months of rows) months.forEach((v, i) => { totals[i] += v ?? 0 })
	return totals
}

/** Recalcula totais de categoria, grupo, receitas, despesas e saldo. Não altera o objeto recebido. */
export function recomputeGrid(grid) {
	const groups = grid.groups.map((group) => {
		const categories = group.categories.map((c) => ({ ...c, totalCents: sum(c.months) }))
		const monthTotalsCents = sumMonths(categories.map((c) => c.months))
		return { ...group, categories, monthTotalsCents, totalCents: sum(monthTotalsCents) }
	})
	const kindTotals = (kind) => {
		const monthTotalsCents = sumMonths(groups.filter((g) => g.kind === kind).map((g) => g.monthTotalsCents))
		return { monthTotalsCents, totalCents: sum(monthTotalsCents) }
	}
	const revenue = kindTotals('RECEITA')
	const expense = kindTotals('DESPESA')
	const balance = revenue.monthTotalsCents.map((v, i) => v - expense.monthTotalsCents[i])
	return { ...grid, groups, totals: { revenue, expense, balance: { monthTotalsCents: balance, totalCents: sum(balance) } } }
}

/** Troca os 12 meses de uma categoria e recalcula os totais. */
export function setCategoryMonths(grid, categoryId, months) {
	return recomputeGrid({
		...grid,
		groups: grid.groups.map((g) => ({
			...g,
			categories: g.categories.map((c) => (c.id === categoryId ? { ...c, months: [...months] } : c))
		}))
	})
}

/** Troca o valor de um mês (1 a 12) de uma categoria e recalcula os totais. */
export function setCell(grid, categoryId, month, amountCents) {
	const category = grid.groups.flatMap((g) => g.categories).find((c) => c.id === categoryId)
	if (!category) return grid
	const months = [...category.months]
	months[month - 1] = amountCents
	return setCategoryMonths(grid, categoryId, months)
}

/** Troca o comentário de um mês (1 a 12) de uma categoria. Comentário não entra em totais. */
export function setCellNote(grid, categoryId, month, note) {
	return {
		...grid,
		groups: grid.groups.map((g) => ({
			...g,
			categories: g.categories.map((c) => {
				if (c.id !== categoryId) return c
				const notes = [...(c.notes ?? Array(12).fill(null))]
				notes[month - 1] = note || null
				return { ...c, notes }
			})
		}))
	}
}
