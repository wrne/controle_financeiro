import 'server-only'
import { cookies } from 'next/headers'
import { SESSION_COOKIE, readToken, sessionCookieOptions } from './auth-token.js'

/** Token da sessão atual, ou null se ausente/vencido. Só no servidor. */
export async function getSessionToken() {
	const token = (await cookies()).get(SESSION_COOKIE)?.value
	return readToken(token) ? token : null
}

/** Usuário da sessão atual ({ login }), ou null. Só para exibir: quem autoriza é o backend. */
export async function getSessionUser() {
	const session = readToken((await cookies()).get(SESSION_COOKIE)?.value)
	return session ? { login: session.login } : null
}

/** Grava o token no cookie httpOnly. Só em Server Action ou Route Handler. */
export async function setSession(token) {
	const session = readToken(token)
	if (!session) throw new Error('Invalid token received from the API.')
	;(await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions(session.exp))
}

/** Apaga o cookie de sessão. Só em Server Action ou Route Handler. */
export async function clearSession() {
	;(await cookies()).delete(SESSION_COOKIE)
}
