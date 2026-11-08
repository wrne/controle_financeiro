import { Suspense } from 'react'
import { safeNextPath } from '@/lib/auth-token'
import { LoginForm } from './login-form'

export const metadata = { title: 'Entrar' }

export default function LoginPage({ searchParams }) {
	return (
		<main className="flex flex-1 items-center justify-center px-4 py-12">
			<div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6 shadow-sm">
				<h1 className="mb-1 text-xl font-semibold">Meu Controle Financeiro</h1>
				<p className="mb-6 text-sm text-muted">Entre para continuar.</p>
				<Suspense fallback={<LoginForm next="/" expired={false} />}>
					<LoginFormWithParams searchParams={searchParams} />
				</Suspense>
			</div>
		</main>
	)
}

async function LoginFormWithParams({ searchParams }) {
	const params = await searchParams
	return <LoginForm next={safeNextPath(params?.next)} expired={params?.expirou === '1'} />
}
