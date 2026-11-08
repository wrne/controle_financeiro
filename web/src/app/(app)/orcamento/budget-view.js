'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Notice, signedClass } from '@/components/ui'
import { formatCents, formatBRL } from '@/lib/money'
import { MONTH_SHORT, MONTH_LONG } from '@/lib/dates'
import { setCell, setCategoryMonths, setCellNote } from '@/lib/budget-grid'
import { BudgetCell } from './budget-cell'
import { saveBudgetCell, saveBudgetNote, replicateBudget } from './actions'

const KIND_LABEL = { RECEITA: 'Receita', DESPESA: 'Despesa' }

/** Grade anual (month = null) ou visão de um mês. O estado local é a fonte da tela depois de cada gravação. */
export function BudgetView({ initialGrid, year, month }) {
	const [grid, setGrid] = useState(initialGrid)
	const [error, setError] = useState(null)

	// Dados novos do servidor (ex.: voltou de Categorias depois de arquivar algo) substituem o estado local.
	const [source, setSource] = useState(initialGrid)
	if (initialGrid !== source) {
		setSource(initialGrid)
		setGrid(initialGrid)
	}

	async function save(categoryId, m, cents) {
		const result = await saveBudgetCell(year, m, categoryId, cents)
		if (!result.ok) {
			setError(result.error)
			return false
		}
		setError(null)
		setGrid((g) => setCell(g, categoryId, m, cents))
		return true
	}

	async function saveNote(categoryId, m, note) {
		const result = await saveBudgetNote(year, m, categoryId, note)
		if (!result.ok) {
			setError(result.error)
			return false
		}
		setError(null)
		setGrid((g) => setCellNote(g, categoryId, m, result.data?.note ?? null))
		return true
	}

	async function replicate(category, m, cents, changed) {
		const following = m < 12 ? `${MONTH_SHORT[m]} a Dez` : ''
		const what = cents === null ? 'limpar' : `receber ${formatBRL(cents)}`
		if (!window.confirm(`"${category.name}": os meses de ${following} vão ${what}. Continuar?`)) return false
		if (changed && !(await save(category.id, m, cents))) return false
		const result = await replicateBudget(year, category.id, m)
		if (!result.ok) {
			setError(result.error)
			return false
		}
		setGrid((g) => setCategoryMonths(g, category.id, result.data.months))
		return true
	}

	if (grid.groups.length === 0) {
		return <p className="text-sm text-muted">Nenhuma categoria cadastrada. Comece por <Link href="/categorias" className="underline">Categorias</Link>.</p>
	}

	return (
		<div>
			{error && <Notice onClose={() => setError(null)}>{error}</Notice>}
			{month === null
				? <YearTable grid={grid} save={save} saveNote={saveNote} replicate={replicate} />
				: <MonthList grid={grid} month={month} save={save} saveNote={saveNote} replicate={replicate} />}
		</div>
	)
}

// Linha sob o cabeçalho fixo (borda comum some quando a célula fica "presa").
const headerLine = 'shadow-[inset_0_-1px_0_var(--line)]'
// Com border-separate, as bordas ficam nas células, não nas linhas.
const tableLines = '[&_tbody_tr>*]:border-t [&_tbody_tr>*]:border-line/60 [&_tfoot_tr>*]:border-t [&_tfoot_tr>*]:border-line [&_tfoot_tr:first-child>*]:border-t-2'

function YearTable({ grid, save, saveNote, replicate }) {
	const cell = 'px-1 py-0.5 text-right'
	return (
		// A área rola nos dois sentidos: o cabeçalho dos meses fica preso no topo e a coluna das categorias à esquerda.
		<div className="max-h-[calc(100dvh-13rem)] min-h-80 overflow-auto rounded-xl border border-line bg-surface">
			<table className={`w-full border-separate border-spacing-0 text-sm ${tableLines}`}>
				<thead>
					<tr className="text-xs text-muted">
						<th className={`sticky left-0 top-0 z-30 bg-surface px-3 py-2 text-left font-medium ${headerLine}`}>Categoria</th>
						{MONTH_SHORT.map((m) => <th key={m} className={`sticky top-0 z-20 bg-surface px-2 py-2 text-right font-medium ${headerLine}`}>{m}</th>)}
						<th className={`sticky top-0 z-20 bg-surface px-3 py-2 text-right font-medium ${headerLine}`}>Total</th>
					</tr>
				</thead>
				{grid.groups.map((group) => (
					<tbody key={group.id}>
						<tr className="bg-background/60 font-medium [&>*]:!border-line">
							<th scope="row" className="sticky left-0 z-10 bg-background px-3 py-1.5 text-left">
								{group.name} <span className="ml-1 text-xs font-normal text-muted">{KIND_LABEL[group.kind]}</span>
							</th>
							{group.monthTotalsCents.map((v, i) => <td key={i} className={`${cell} px-2 tabular-nums`}>{formatCents(v)}</td>)}
							<td className="px-3 py-1.5 text-right tabular-nums">{formatCents(group.totalCents)}</td>
						</tr>
						{group.categories.map((category) => (
							<tr key={category.id} className="hover:bg-background/40">
								<th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-0.5 pl-6 text-left font-normal">
									{category.name}
									{category.archived && <span className="ml-1 text-xs text-amber-700 dark:text-amber-300">(arquivada)</span>}
								</th>
								{category.months.map((value, i) => (
									<td key={i} className={cell}>
										<BudgetCell
											value={value}
											note={category.notes?.[i] ?? null}
											onSaveNote={(note) => saveNote(category.id, i + 1, note)}
											disabled={category.archived}
											label={`${category.name}, ${MONTH_LONG[i]}`}
											onSave={(cents) => save(category.id, i + 1, cents)}
											onReplicate={i < 11 ? (cents, changed) => replicate(category, i + 1, cents, changed) : undefined}
										/>
									</td>
								))}
								<td className="px-3 py-0.5 text-right tabular-nums text-muted">{formatCents(category.totalCents)}</td>
							</tr>
						))}
					</tbody>
				))}
				<tfoot className="font-medium">
					<TotalRow label="Receitas" totals={grid.totals.revenue} />
					<TotalRow label="Despesas" totals={grid.totals.expense} />
					<TotalRow label="Saldo (receitas − despesas)" totals={grid.totals.balance} signed />
				</tfoot>
			</table>
		</div>
	)
}

function TotalRow({ label, totals, signed = false }) {
	return (
		<tr>
			<th scope="row" className="sticky left-0 z-10 bg-surface px-3 py-1.5 text-left">{label}</th>
			{totals.monthTotalsCents.map((v, i) => <td key={i} className={`px-2 py-1.5 text-right tabular-nums ${signed ? signedClass(v) : ''}`}>{formatCents(v)}</td>)}
			<td className={`px-3 py-1.5 text-right tabular-nums ${signed ? signedClass(totals.totalCents) : ''}`}>{formatCents(totals.totalCents)}</td>
		</tr>
	)
}

function MonthList({ grid, month, save, saveNote, replicate }) {
	const i = month - 1
	const revenue = grid.totals.revenue.monthTotalsCents[i]
	const expense = grid.totals.expense.monthTotalsCents[i]
	const balance = grid.totals.balance.monthTotalsCents[i]

	return (
		<div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
			<div className="flex flex-col gap-4">
				{grid.groups.map((group) => (
					<section key={group.id} className="rounded-xl border border-line bg-surface">
						<header className="flex items-center justify-between border-b border-line px-4 py-2 font-medium">
							<span>{group.name} <span className="ml-1 text-xs font-normal text-muted">{KIND_LABEL[group.kind]}</span></span>
							<span className="tabular-nums">{formatBRL(group.monthTotalsCents[i])}</span>
						</header>
						<ul className="divide-y divide-line/60">
							{group.categories.map((category) => (
								<li key={category.id} className="flex items-center justify-between gap-3 px-4 py-1">
									<span className="flex min-w-0 flex-col text-sm">
										<span>
											{category.name}
											{category.archived && <span className="ml-1 text-xs text-amber-700 dark:text-amber-300">(arquivada)</span>}
										</span>
										{category.notes?.[i] && <span className="whitespace-pre-line break-words text-xs text-muted">💬 {category.notes[i]}</span>}
									</span>
									<BudgetCell
										wide
										value={category.months[i]}
										note={category.notes?.[i] ?? null}
										onSaveNote={(note) => saveNote(category.id, month, note)}
										disabled={category.archived}
										label={`${category.name}, ${MONTH_LONG[i]}`}
										onSave={(cents) => save(category.id, month, cents)}
										onReplicate={month < 12 ? (cents, changed) => replicate(category, month, cents, changed) : undefined}
									/>
								</li>
							))}
						</ul>
					</section>
				))}
			</div>
			<aside className="h-fit rounded-xl border border-line bg-surface p-4 lg:sticky lg:top-4">
				<h2 className="mb-3 font-medium capitalize">{MONTH_LONG[i]}</h2>
				<dl className="flex flex-col gap-2 text-sm">
					<div className="flex justify-between"><dt className="text-muted">Receitas</dt><dd className="tabular-nums">{formatBRL(revenue)}</dd></div>
					<div className="flex justify-between"><dt className="text-muted">Despesas</dt><dd className="tabular-nums">{formatBRL(expense)}</dd></div>
					<div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Saldo</dt><dd className={`tabular-nums ${signedClass(balance)}`}>{formatBRL(balance)}</dd></div>
				</dl>
				<p className="mt-3 text-xs text-muted">O Resultado líquido (com investimentos e despesas de trabalho separados) está em <Link href="/resultado" className="underline">Resultado</Link>.</p>
			</aside>
		</div>
	)
}
