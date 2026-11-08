'use server'

import { redirect } from 'next/navigation'
import { clearSession } from '@/lib/session'

// O backend não guarda sessão: sair é apagar o cookie. O JWT continua válido até expirar (no máximo 1h),
// mas só existia nesse cookie httpOnly.
export async function logout() {
	await clearSession()
	redirect('/login')
}
