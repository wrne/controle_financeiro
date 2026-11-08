'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { backendRequest } from '@/lib/api'
import { setSession } from '@/lib/session'
import { safeNextPath } from '@/lib/auth-token'

const MESSAGES = {
	400: 'Login ou senha inválidos.',
	401: 'Login ou senha inválidos.',
	429: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
}

// IP do navegador, repassado ao backend para o limite de tentativas de login (só vale com TRUST_PROXY lá).
async function clientIp() {
	const forwarded = (await headers()).get('x-forwarded-for')
	return forwarded?.split(',').at(-1)?.trim() || undefined
}

export async function login(_prevState, formData) {
	const loginValue = String(formData.get('login') ?? '').trim()
	const password = String(formData.get('password') ?? '')

	if (!loginValue || !password) {
		return { error: 'Informe login e senha.', login: loginValue }
	}

	const ip = await clientIp()
	let result
	try {
		result = await backendRequest('/login', {
			method: 'POST',
			body: { login: loginValue, password },
			headers: ip ? { 'X-Forwarded-For': ip } : {}
		})
	} catch {
		return { error: 'Não foi possível falar com o servidor. Tente de novo.', login: loginValue }
	}

	if (result.status !== 200) {
		return { error: MESSAGES[result.status] ?? 'Não foi possível entrar agora. Tente de novo.', login: loginValue }
	}

	try {
		await setSession(result.body?.data?.token)
	} catch {
		return { error: 'Não foi possível entrar agora. Tente de novo.', login: loginValue }
	}

	redirect(safeNextPath(formData.get('next')))
}
