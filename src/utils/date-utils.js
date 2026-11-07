/**
 * Data de hoje no formato YYYY-MM-DD, no fuso de São Paulo (evita "virar o dia" em UTC à noite).
 */
export function todayIso() {
	return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
}
