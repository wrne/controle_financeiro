'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
	{ href: '/', label: 'Início' },
	{ href: '/orcamento', label: 'Orçamento' },
	{ href: '/resultado', label: 'Resultado' },
	{ href: '/categorias', label: 'Categorias' }
]

export function NavLinks() {
	const pathname = usePathname()
	return (
		<nav className="flex flex-1 flex-wrap gap-x-4 gap-y-1 text-sm">
			{LINKS.map(({ href, label }) => {
				const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
				return (
					<Link
						key={href}
						href={href}
						aria-current={active ? 'page' : undefined}
						className={active ? 'font-medium text-foreground' : 'text-muted hover:text-foreground'}
					>
						{label}
					</Link>
				)
			})}
		</nav>
	)
}
