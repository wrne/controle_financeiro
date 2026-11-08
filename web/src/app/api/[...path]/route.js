import { NextResponse } from 'next/server'
import { SESSION_COOKIE, readToken } from '@/lib/auth-token'

// Proxy do navegador para o backend: /api/<caminho> → API_URL/<caminho>, com o token do cookie httpOnly.
// Rotas públicas do backend (login, docs) não passam por aqui.

const BLOCKED = new Set(['login', 'docs', 'newUser'])

function json(status, message) {
	return NextResponse.json({ status, message, error: message }, { status })
}

// Proteção contra CSRF: requisição que altera dados precisa vir da própria origem do site.
function isSameOrigin(request) {
	const origin = request.headers.get('origin')
	if (!origin) return false
	const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
	try {
		return new URL(origin).host === host
	} catch {
		return false
	}
}

async function handle(request, { params }) {
	const { path } = await params

	if (!path?.length || BLOCKED.has(path[0]) || path.some((segment) => segment === '.' || segment === '..')) {
		return json(404, 'Route not found.')
	}

	const method = request.method
	if (method !== 'GET' && !isSameOrigin(request)) {
		return json(403, 'Forbidden.')
	}

	const token = request.cookies.get(SESSION_COOKIE)?.value
	if (!readToken(token)) {
		const response = json(401, 'Sessão expirada.')
		if (token) response.cookies.delete(SESSION_COOKIE)
		return response
	}

	const target = new URL(process.env.API_URL)
	target.pathname = '/' + path.map(encodeURIComponent).join('/')
	target.search = request.nextUrl.search

	const headers = { Accept: 'application/json', Authorization: `Bearer ${token}` }
	const contentType = request.headers.get('content-type')
	if (contentType) headers['Content-Type'] = contentType

	let upstream
	try {
		upstream = await fetch(target, {
			method,
			headers,
			body: method === 'GET' ? undefined : await request.arrayBuffer(),
			cache: 'no-store',
			redirect: 'manual'
		})
	} catch {
		return json(502, 'API indisponível.')
	}

	const response = new NextResponse(upstream.body, {
		status: upstream.status,
		headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' }
	})
	if (upstream.status === 401) response.cookies.delete(SESSION_COOKIE)
	return response
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE }
