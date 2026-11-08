import 'server-only'
import { redirect } from 'next/navigation'
import { getSessionToken } from './session.js'

// Cliente da API para o servidor do Next (Server Components e Server Actions).
// O token sai do cookie httpOnly e vai no Authorization: o navegador nunca o vê.

export class ApiError extends Error {
	constructor(status, message) {
		super(message)
		this.name = 'ApiError'
		this.status = status
	}
}

function apiUrl(path) {
	const base = process.env.API_URL
	if (!base) throw new Error('API_URL is not configured.')
	return new URL(path, base)
}

/**
 * Chamada crua ao backend, sem sessão (usada no login).
 * @returns {Promise<{ status: number, body: any }>}
 */
export async function backendRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
	const response = await fetch(apiUrl(path), {
		method,
		headers: {
			Accept: 'application/json',
			...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...headers
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
		cache: 'no-store',
		redirect: 'manual'
	})

	const payload = await response.json().catch(() => null)
	return { status: response.status, body: payload }
}

/**
 * Chamada autenticada. Sem sessão ou com token recusado, manda para o login.
 * @returns {Promise<any>} o campo `data` da resposta
 */
export async function api(path, options = {}) {
	const token = await getSessionToken()
	if (!token) redirect('/login')

	const { status, body } = await backendRequest(path, { ...options, token })

	if (status === 401) redirect('/login?expirou=1')
	if (status < 200 || status >= 300) {
		throw new ApiError(status, body?.message ?? 'Erro ao chamar a API.')
	}
	return body?.data
}
