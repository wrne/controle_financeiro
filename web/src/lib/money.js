// Valores monetários: a API trabalha em centavos (inteiro). A conversão para R$ acontece só aqui, na borda.
// Nada de ponto flutuante: o texto digitado é convertido dígito a dígito.

const MAX_CENTS = 99_999_999_999_99 // R$ 99.999.999.999,99 (cabe com folga num inteiro seguro)

/**
 * Converte o texto digitado em pt-BR para centavos.
 * Aceita "1.234,56", "1234,56", "1234", "R$ 10,00", "-10,50", "0,5" e "12.5" (ponto com 1 ou 2 casas e sem
 * vírgula é tratado como decimal). Ponto seguido de 3 dígitos é separador de milhar ("1.234" = R$ 1.234,00).
 * @param {string} text
 * @returns {number | null} centavos, ou null se vazio ou inválido
 */
export function parseBRL(text) {
	if (typeof text !== 'string') return null

	let value = text.replace(/R\$/gi, '').replace(/[\s ]/g, '')
	if (value === '') return null

	let negative = false
	if (value.startsWith('-')) {
		negative = true
		value = value.slice(1)
	}

	let intPart
	let fracPart = ''

	if (value.includes(',')) {
		const parts = value.split(',')
		if (parts.length !== 2) return null
		;[intPart, fracPart] = parts
		if (!/^\d{0,2}$/.test(fracPart)) return null
		if (!isValidIntPart(intPart)) return null
	} else if (/^\d+\.\d{1,2}$/.test(value)) {
		// "12.5" ou "1234.56": ponto usado como decimal
		;[intPart, fracPart] = value.split('.')
	} else {
		intPart = value
		if (!isValidIntPart(intPart)) return null
	}

	const digits = intPart.replace(/\./g, '')
	if (digits === '' && fracPart === '') return null

	const cents = Number((digits || '0') + fracPart.padEnd(2, '0'))
	if (!Number.isSafeInteger(cents) || cents > MAX_CENTS) return null

	return negative && cents !== 0 ? -cents : cents
}

// Parte inteira: só dígitos ("1234") ou agrupada de 3 em 3 com ponto ("1.234.567"). Vazia vale (",50").
function isValidIntPart(intPart) {
	return intPart === '' || /^\d+$/.test(intPart) || /^\d{1,3}(\.\d{3})+$/.test(intPart)
}

/**
 * Formata centavos sem o símbolo: 123456 → "1.234,56".
 * @param {number} cents
 */
export function formatCents(cents) {
	if (!Number.isSafeInteger(cents)) return ''

	const abs = Math.abs(cents)
	const reais = Math.floor(abs / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
	const centavos = String(abs % 100).padStart(2, '0')

	return `${cents < 0 ? '-' : ''}${reais},${centavos}`
}

/**
 * Formata centavos em reais: 123456 → "R$ 1.234,56"; -1050 → "-R$ 10,50".
 * @param {number} cents
 */
export function formatBRL(cents) {
	if (!Number.isSafeInteger(cents)) return ''
	const text = formatCents(Math.abs(cents))
	return `${cents < 0 ? '-' : ''}R$ ${text}`
}
