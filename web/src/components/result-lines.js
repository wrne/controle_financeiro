// Linhas do Resultado, na ordem da planilha. Despesas aparecem com sinal negativo, como na fórmula.

export const RESULT_LINES = [
	{ key: 'grossRevenueCents', label: 'Receita bruta', sign: 1 },
	{ key: 'workExpensesCents', label: 'Despesas de trabalho', sign: -1 },
	{ key: 'revenueBeforeInvestmentsCents', label: 'Receita antes de investimentos', sign: 1, subtotal: true },
	{ key: 'investmentsCents', label: 'Investimentos', sign: -1 },
	{ key: 'netRevenueCents', label: 'Receita líquida', sign: 1, subtotal: true },
	{ key: 'personalExpensesCents', label: 'Despesas pessoais', sign: -1 },
	{ key: 'netResultCents', label: 'Resultado líquido', sign: 1, subtotal: true, final: true }
]
