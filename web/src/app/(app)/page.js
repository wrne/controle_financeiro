import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatBRL } from '@/lib/money'
import { MONTH_LONG } from '@/lib/dates'
import { currentYearMonthAtRequest } from '@/lib/request-date'
import { signedClass } from '@/components/ui'
import { RESULT_LINES } from '@/components/result-lines'

export const metadata = { title: 'Início' }

export default function HomePage() {
	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold">Início</h1>
			<Suspense fallback={<p className="text-sm text-muted">Carregando…</p>}>
				<MonthSummary />
			</Suspense>
		</div>
	)
}

async function MonthSummary() {
	const groups = await api('/category-groups')
	const { year, month } = await currentYearMonthAtRequest()
	const result = await api(`/results/${year}`)
	const m = result.months[month - 1]
	const categoriesCount = groups.reduce((n, g) => n + g.categories.length, 0)

	return (
		<div className="grid gap-4 md:grid-cols-[1fr_16rem]">
			<section className="rounded-xl border border-line bg-surface p-5">
				<div className="mb-3 flex items-baseline justify-between">
					<h2 className="font-medium">Resultado orçado de <span className="capitalize">{MONTH_LONG[month - 1]}</span> de {year}</h2>
					<Link href={`/resultado?ano=${year}`} className="text-sm text-muted underline">Ver o ano</Link>
				</div>
				<dl className="flex flex-col gap-1.5 text-sm">
					{RESULT_LINES.map((line) => {
						const value = m[line.key] * line.sign
						return (
							<div key={line.key} className={`flex justify-between ${line.subtotal ? 'border-t border-line pt-1.5 font-medium' : ''} ${line.final ? 'text-base font-semibold' : ''}`}>
								<dt className={line.subtotal ? '' : 'text-muted'}>{line.label}</dt>
								<dd className={`tabular-nums ${signedClass(value)}`}>{formatBRL(value)}</dd>
							</div>
						)
					})}
				</dl>
			</section>
			<nav className="flex flex-col gap-2 text-sm">
				<Link href={`/orcamento?ano=${year}&mes=${month}`} className="rounded-xl border border-line bg-surface p-4 hover:bg-background">
					<span className="block font-medium">Orçamento do mês</span>
					<span className="text-muted">Editar os valores de {MONTH_LONG[month - 1]}</span>
				</Link>
				<Link href={`/orcamento?ano=${year}`} className="rounded-xl border border-line bg-surface p-4 hover:bg-background">
					<span className="block font-medium">Grade do ano</span>
					<span className="text-muted">Categorias × 12 meses</span>
				</Link>
				<Link href="/categorias" className="rounded-xl border border-line bg-surface p-4 hover:bg-background">
					<span className="block font-medium">Categorias</span>
					<span className="text-muted">{groups.length} grupos, {categoriesCount} categorias</span>
				</Link>
			</nav>
		</div>
	)
}
