import { z } from 'zod'
import { AppError } from './app-error.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidIsoDate(value) {
	const d = new Date(`${value}T00:00:00Z`)
	return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value
}

/** UUID */
export const uuid = z.string().regex(UUID_RE, 'must be a valid uuid')

/** Data no formato YYYY-MM-DD */
export const isoDate = z.string()
	.regex(/^\d{4}-\d{2}-\d{2}$/, 'must be in YYYY-MM-DD format')
	.refine(isValidIsoDate, 'invalid date')

/**
 * Valor monetário em Reais. Aceita número ou texto ("10.5", "10,50") e normaliza para "10.50".
 * Até 8 dígitos inteiros e 2 decimais (compatível com numeric(10,2)).
 * Na Entrega 1 este schema passa a trabalhar com centavos inteiros.
 */
export const money = z.union([z.string(), z.number()])
	.transform((v) => String(v).trim().replace(',', '.'))
	.refine((v) => /^-?\d{1,8}(\.\d{1,2})?$/.test(v), 'invalid amount (max 8 digits and 2 decimals)')
	.transform((v) => Number(v).toFixed(2))

/** Maior valor aceito em centavos (R$ 99.999.999.999,99), o mesmo limite do front. */
export const MAX_CENTS = 9_999_999_999_999

/** Valor em centavos: inteiro, sem sinal (ex.: 123456 = R$ 1.234,56). */
export const amountCents = z.number().int('must be an integer amount in cents').min(0).max(MAX_CENTS)

/** Ano (vem como texto em params/query) */
export const year = z.coerce.number().int().min(2000).max(2100)

/** Mês do calendário, 1 a 12 (vem como texto em params/query) */
export const month = z.coerce.number().int().min(1).max(12)

/** Booleano vindo de query string ("true"/"false") */
export const queryBoolean = z.enum(['true', 'false']).transform((v) => v === 'true')

/** Parâmetros de rota com :id */
export const idParams = z.object({ id: uuid })

/** Exige que ao menos um campo tenha sido enviado (usado nos PUT) */
export const atLeastOneField = (obj) => Object.keys(obj).length > 0

function parseOrThrow(schema, data, where) {
	const result = schema.safeParse(data ?? {})
	if (!result.success) {
		const details = result.error.issues
			.map((issue) => `${[where, ...issue.path].join('.')}: ${issue.message}`)
			.join('; ')
		throw new AppError(400, `Validation failed - ${details}`)
	}
	return result.data
}

/**
 * Middleware de validação. Substitui req.body / req.query / req.params pelos dados já
 * validados e normalizados (campos desconhecidos são descartados).
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
export function validate({ body, query, params } = {}) {
	return (req, res, next) => {
		try {
			if (params) req.params = parseOrThrow(params, req.params, 'params')
			if (query) req.query = parseOrThrow(query, req.query, 'query')
			if (body) req.body = parseOrThrow(body, req.body, 'body')
			next()
		} catch (error) {
			res.error(400, error, 'Invalid request')
		}
	}
}
