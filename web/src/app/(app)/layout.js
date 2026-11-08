import { Suspense } from 'react'
import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { NavLinks } from '@/components/nav-links'
import { logout } from './actions'

// Layout das telas autenticadas. O proxy já mandou quem não tem sessão para o login.
export default function AppLayout({ children }) {
	return (
		<div className="flex min-h-full flex-1 flex-col">
			<header className="border-b border-line bg-surface">
				<div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
					<Link href="/" className="font-semibold">Meu Controle Financeiro</Link>
					<NavLinks />
					<Suspense fallback={<span className="text-sm text-muted">…</span>}>
						<UserMenu />
					</Suspense>
				</div>
			</header>
			<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">{children}</main>
		</div>
	)
}

async function UserMenu() {
	const user = await getSessionUser()
	return (
		<div className="flex items-center gap-3 text-sm">
			<span className="text-muted">{user?.login}</span>
			<form action={logout}>
				<button type="submit" className="rounded-md border border-line px-3 py-1 hover:bg-background">Sair</button>
			</form>
		</div>
	)
}
