// Cálculo do Resultado (regra da planilha original, aba "Resultado"):
// Receita bruta − Despesas de trabalho = Receita antes de investimentos
//   − Investimentos = Receita líquida − Despesas pessoais = Resultado líquido.
// Valores em centavos. As despesas são devolvidas como valores positivos; as linhas calculadas podem ser negativas.
// Na Entrega 1 só existe orçado; na Entrega 2 entra a regra "realizado, senão orçado".

const LINE_BY_CLASS = { TRABALHO: 'workExpensesCents', INVESTIMENTO: 'investmentsCents', BASICO: 'personalExpensesCents' }

function emptyLine() {
	return { grossRevenueCents: 0, workExpensesCents: 0, investmentsCents: 0, personalExpensesCents: 0 }
}

function finish(line) {
	const revenueBeforeInvestmentsCents = line.grossRevenueCents - line.workExpensesCents
	const netRevenueCents = revenueBeforeInvestmentsCents - line.investmentsCents
	return {
		grossRevenueCents: line.grossRevenueCents,
		workExpensesCents: line.workExpensesCents,
		revenueBeforeInvestmentsCents,
		investmentsCents: line.investmentsCents,
		netRevenueCents,
		personalExpensesCents: line.personalExpensesCents,
		netResultCents: netRevenueCents - line.personalExpensesCents
	}
}

/**
 * @param {{ groups: object[], categories: object[], items: { categoryId: string, month: number, amountCents: number }[] }} data
 * @returns {{ months: object[], total: object }} months[0] = janeiro
 */
export function computeResults({ groups, categories, items }) {
	const groupById = new Map(groups.map((g) => [g.id, g]))
	const lineByCategory = new Map()
	for (const c of categories) {
		const group = groupById.get(c.groupId)
		if (!group) continue
		const line = group.kind === 'RECEITA' ? 'grossRevenueCents' : LINE_BY_CLASS[group.resultClass]
		if (line) lineByCategory.set(c.id, line)
	}

	const months = Array.from({ length: 12 }, emptyLine)
	const total = emptyLine()
	for (const item of items) {
		const line = lineByCategory.get(item.categoryId)
		if (!line) continue
		months[item.month - 1][line] += item.amountCents
		total[line] += item.amountCents
	}

	return {
		months: months.map((line, i) => ({ month: i + 1, ...finish(line) })),
		total: finish(total)
	}
}
