import { Suspense } from 'react'
import { api } from '@/lib/api'
import { formatCents } from '@/lib/money'
import { parseYear, MONTH_SHORT } from '@/lib/dates'
import { currentYearMonthAtRequest } from '@/lib/request-date'
import { PageHeader, YearSwitcher, signedClass } from '@/components/ui'
import { RESULT_LINES } from '@/components/result-lines'

export const metadata = { title: 'Resultado' }

export default function ResultPage({ searchParams }) {
	return (
		<Suspense fallback={<><PageHeader title="Resultado" /><p className="text-sm text-muted">Carregando…</p></>}>
			<Result searchParams={searchParams} />
		</Suspense>
	)
}

async function Result({ searchParams }) {
	const params = await searchParams
	const now = await currentYearMonthAtRequest()
	const year = parseYear(params?.ano, now.year)
	const result = await api(`/results/${year}`)
	const currentMonth = year === now.year ? now.month : null

	return (
		<div>
			<PageHeader title="Resultado">
				<span className="rounded bg-background px-2 py-0.5 text-xs text-muted">Orçado</span>
				<YearSwitcher basePath="/resultado" year={year} />
			</PageHeader>
			<p className="mb-4 text-sm text-muted">
				Receita bruta − Despesas de trabalho − Investimentos − Despesas pessoais = Resultado líquido. Por enquanto só com valores orçados; o realizado entra na Entrega 2.
			</p>

			<div className="overflow-x-auto rounded-xl border border-line bg-surface">
				<table className="w-full border-collapse text-sm">
					<thead>
						<tr className="border-b border-line text-xs text-muted">
							<th className="sticky left-0 z-10 bg-surface px-3 py-2 text-left font-medium">R$</th>
							{MONTH_SHORT.map((m, i) => (
								<th key={m} className={`px-2 py-2 text-right font-medium ${currentMonth === i + 1 ? 'text-foreground' : ''}`}>{m}</th>
							))}
							<th className="px-3 py-2 text-right font-medium">Ano</th>
						</tr>
					</thead>
					<tbody>
						{RESULT_LINES.map((line) => {
							const value = (v) => v * line.sign
							const rowClass = line.final ? 'border-t-2 border-line font-semibold' : line.subtotal ? 'border-t border-line font-medium bg-background/50' : 'border-t border-line/60'
							return (
								<tr key={line.key} className={rowClass}>
									<th scope="row" className={`sticky left-0 z-10 px-3 py-1.5 text-left ${line.subtotal ? 'bg-background' : 'bg-surface'} ${line.subtotal ? '' : 'font-normal'}`}>{line.label}</th>
									{result.months.map((m) => (
										<td key={m.month} className={`px-2 py-1.5 text-right tabular-nums ${signedClass(value(m[line.key]))} ${currentMonth === m.month ? 'bg-accent/5' : ''}`}>
											{formatCents(value(m[line.key]))}
										</td>
									))}
									<td className={`px-3 py-1.5 text-right tabular-nums ${signedClass(value(result.total[line.key]))}`}>{formatCents(value(result.total[line.key]))}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
