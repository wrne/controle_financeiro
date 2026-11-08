// Datas no fuso America/Sao_Paulo (o mês "atual" não pode depender do fuso do servidor).

export const TIME_ZONE = 'America/Sao_Paulo'

export const MONTH_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
export const MONTH_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

/**
 * Ano e mês atuais em São Paulo.
 * @param {Date} [now]
 * @returns {{ year: number, month: number }} month de 1 a 12
 */
export function currentYearMonth(now = new Date()) {
	const parts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: 'numeric' }).formatToParts(now)
	return {
		year: Number(parts.find((p) => p.type === 'year').value),
		month: Number(parts.find((p) => p.type === 'month').value)
	}
}

/** Ano vindo da URL (?ano=2026), ou o padrão se ausente/inválido. */
export function parseYear(value, fallback) {
	const year = Number(value)
	return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : fallback
}

/** Mês vindo da URL (?mes=3), ou null se ausente/inválido. */
export function parseMonth(value) {
	const month = Number(value)
	return Number.isInteger(month) && month >= 1 && month <= 12 ? month : null
}
