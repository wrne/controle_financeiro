import { NextResponse } from 'next/server'
import { SESSION_COOKIE, readToken } from '@/lib/auth-token'

// Checagem otimista: sem sessão válida, vai para o login; logado, não vê a tela de login.
// Lê só o cookie (sem chamar a API). A autorização de verdade é feita pelo backend.

const PUBLIC_PATHS = ['/login']

export function proxy(request) {
	const { pathname, search } = request.nextUrl
	const token = request.cookies.get(SESSION_COOKIE)?.value
	const session = readToken(token)
	const isPublic = PUBLIC_PATHS.includes(pathname)

	if (!session && !isPublic) {
		const loginUrl = new URL('/login', request.url)
		if (pathname !== '/') loginUrl.searchParams.set('next', pathname + search)
		if (token) loginUrl.searchParams.set('expirou', '1')

		const response = NextResponse.redirect(loginUrl)
		if (token) response.cookies.delete(SESSION_COOKIE)
		return response
	}

	if (session && isPublic) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)']
}
