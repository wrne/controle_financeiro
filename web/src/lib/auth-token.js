// Leitura do JWT emitido pelo backend e regras do cookie de sessão.
// Este módulo não verifica a assinatura (o segredo fica só no backend): serve para checagens otimistas
// (redirecionar para o login, mostrar o usuário). Quem autoriza de verdade é o backend, a cada chamada.

export const SESSION_COOKIE = 'fin_session'

// Folga para considerar o token vencido um pouco antes, evitando enviar um token que expira no caminho.
const CLOCK_SKEW_SECONDS = 30

/**
 * Lê o payload do JWT sem olhar o relógio (serve na renderização: com cacheComponents, ler o relógio ali
 * dá "blocking-prerender-current-time"). A validade é conferida no proxy, na rota /api e pelo backend.
 * @param {string | undefined | null} token
 * @returns {{ login: string, exp: number } | null} null se ausente ou malformado
 */
export function decodeToken(token) {
	if (typeof token !== 'string' || token.length > 4096) return null

	const parts = token.split('.')
	if (parts.length !== 3) return null

	let payload
	try {
		payload = JSON.parse(decodeBase64Url(parts[1]))
	} catch {
		return null
	}

	if (typeof payload?.login !== 'string' || !Number.isInteger(payload?.exp)) return null
	return { login: payload.login, exp: payload.exp }
}

/**
 * Lê o payload do JWT e confere a validade. Só onde a requisição já chegou (proxy, Route Handler, Server Action).
 * @param {string | undefined | null} token
 * @param {number} [nowMs]
 * @returns {{ login: string, exp: number } | null} null se ausente, malformado ou vencido
 */
export function readToken(token, nowMs = Date.now()) {
	const payload = decodeToken(token)
	if (!payload) return null
	if (payload.exp * 1000 <= nowMs + CLOCK_SKEW_SECONDS * 1000) return null
	return payload
}

/**
 * Opções do cookie de sessão: httpOnly (o JavaScript da página não lê o token) e vencendo junto com o JWT.
 * @param {number} exp expiração do JWT em segundos (epoch)
 * @param {number} [nowMs]
 */
export function sessionCookieOptions(exp, nowMs = Date.now()) {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: Math.max(0, exp - Math.floor(nowMs / 1000))
	}
}

/**
 * Destino depois do login. Só aceita caminho interno ("/orcamento"), nunca outro site ("//x.com", "https://...").
 * @param {unknown} next
 */
export function safeNextPath(next) {
	if (typeof next !== 'string' || next.length > 2048) return '/'
	if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/'
	if (/[\u0000-\u001f]/.test(next)) return '/'
	if (next === '/login' || next.startsWith('/login?') || next.startsWith('/api/')) return '/'
	return next
}

function decodeBase64Url(segment) {
	const base64 = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=')
	const binary = atob(base64)
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
	return new TextDecoder().decode(bytes)
}
