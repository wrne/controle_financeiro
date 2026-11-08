import 'server-only'
import { unstable_rethrow } from 'next/navigation'
import { friendlyError } from './api-errors.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Executa uma Server Action e devolve { ok, data } ou { ok: false, error } com mensagem para a tela.
 * Redirecionamentos (ex.: sessão expirada → login) são repassados, não viram erro.
 */
export async function runAction(fn, fallback) {
	try {
		return { ok: true, data: await fn() }
	} catch (error) {
		unstable_rethrow(error)
		return { ok: false, error: friendlyError(error, fallback) }
	}
}

/** Id que vai no caminho da URL da API: só UUID (evita montar caminhos arbitrários). */
export function assertUuid(value) {
	if (typeof value !== 'string' || !UUID_RE.test(value)) throw new Error('invalid id')
	return value
}

export function assertInt(value, min, max) {
	if (!Number.isInteger(value) || value < min || value > max) throw new Error('invalid number')
	return value
}
