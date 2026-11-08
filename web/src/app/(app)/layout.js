import { Suspense } from 'react'
import Link from 'next/link'
import { getSessionUser } from '@/lib/session'
import { logout } from './actions'

// Layout das telas autenticadas. O proxy já mandou quem não tem sessão para o login.
export default function AppLayout({ children }) {
	return (
		<div className="flex min-h-full flex-1 flex-col">
			<header className="border-b border-line bg-surface">
				<div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
					<Link href="/" className="font-semibold">Meu Controle Financeiro</Link>
					<nav className="flex flex-1 gap-4 text-sm">
						<Link href="/" className="text-muted hover:text-foreground">Início</Link>
					</nav>
					<Suspense fallback={<span className="text-sm text-muted">…</span>}>
						<UserMenu />
					</Suspense>
				</div>
			</header>
			<main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
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
