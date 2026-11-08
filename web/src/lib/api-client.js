// Cliente da API para Client Components. Chama a rota /api/... do próprio Next, que acrescenta o token
// do cookie httpOnly e repassa ao backend. O JavaScript da página nunca vê o token.

export class ApiClientError extends Error {
	constructor(status, message) {
		super(message)
		this.name = 'ApiClientError'
		this.status = status
	}
}

/**
 * @param {string} path caminho da API do backend, ex.: "/categories"
 * @param {{ method?: string, body?: unknown }} [options]
 * @returns {Promise<any>} o campo `data` da resposta
 */
export async function apiClient(path, { method = 'GET', body } = {}) {
	const response = await fetch(`/api${path}`, {
		method,
		headers: {
			Accept: 'application/json',
			...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
		},
		body: body !== undefined ? JSON.stringify(body) : undefined,
		cache: 'no-store'
	})

	const payload = await response.json().catch(() => null)

	if (response.status === 401) {
		const next = encodeURIComponent(window.location.pathname + window.location.search)
		// Recarga completa de propósito: passa pelo proxy, que limpa o cookie vencido e descarta o estado da página.
		// eslint-disable-next-line @next/next/no-location-assign-relative-destination
		window.location.assign(`/login?expirou=1&next=${next}`)
		throw new ApiClientError(401, 'Sessão expirada.')
	}
	if (!response.ok) {
		throw new ApiClientError(response.status, payload?.message ?? 'Erro ao chamar a API.')
	}
	return payload?.data
}
