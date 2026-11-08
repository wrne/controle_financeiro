import { Suspense } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { parseYear, parseMonth, MONTH_LONG } from '@/lib/dates'
import { currentYearMonthAtRequest } from '@/lib/request-date'
import { PageHeader, YearSwitcher, iconButtonClass } from '@/components/ui'
import { BudgetView } from './budget-view'

export const metadata = { title: 'Orçamento' }

export default function BudgetPage({ searchParams }) {
	return (
		<Suspense fallback={<><PageHeader title="Orçamento" /><p className="text-sm text-muted">Carregando…</p></>}>
			<Budget searchParams={searchParams} />
		</Suspense>
	)
}

async function Budget({ searchParams }) {
	const params = await searchParams
	const now = await currentYearMonthAtRequest()
	const year = parseYear(params?.ano, now.year)
	const month = parseMonth(params?.mes)
	const grid = await api(`/budget/${year}`)

	const defaultMonth = year === now.year ? now.month : 1
	const tab = (active) => `rounded-md px-3 py-1 text-sm ${active ? 'bg-accent text-white' : 'text-muted hover:text-foreground'}`

	return (
		<div>
			<PageHeader title="Orçamento">
				<div className="flex rounded-lg border border-line bg-surface p-0.5">
					<Link href={`/orcamento?ano=${year}`} className={tab(month === null)}>Ano</Link>
					<Link href={`/orcamento?ano=${year}&mes=${month ?? defaultMonth}`} className={tab(month !== null)}>Mês</Link>
				</div>
				{month !== null && (
					<div className="flex items-center gap-1 text-sm">
						<Link href={`/orcamento?ano=${month === 1 ? year - 1 : year}&mes=${month === 1 ? 12 : month - 1}`} className={iconButtonClass} aria-label="Mês anterior">‹</Link>
						<span className="min-w-20 text-center capitalize">{MONTH_LONG[month - 1]}</span>
						<Link href={`/orcamento?ano=${month === 12 ? year + 1 : year}&mes=${month === 12 ? 1 : month + 1}`} className={iconButtonClass} aria-label="Próximo mês">›</Link>
					</div>
				)}
				<YearSwitcher basePath="/orcamento" year={year} params={month ? { mes: String(month) } : {}} />
			</PageHeader>
			<p className="mb-4 text-sm text-muted">
				Clique num valor para editar. Enter salva, Esc cancela, vazio remove. Durante a edição, → copia o valor para os meses seguintes e 💬 abre o comentário da célula (marca laranja no canto).
			</p>
			<BudgetView key={year} initialGrid={grid} year={year} month={month} />
		</div>
	)
}
