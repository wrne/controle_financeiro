// Peças visuais pequenas usadas nas telas (sem estado).

import Link from 'next/link'

export const inputClass = 'rounded-md border border-line bg-surface px-2 py-1.5 text-sm'
export const buttonClass = 'rounded-md border border-line bg-surface px-3 py-1.5 text-sm hover:bg-background disabled:opacity-50'
export const primaryButtonClass = 'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50'
export const iconButtonClass = 'rounded px-1.5 py-0.5 text-xs text-muted hover:bg-background hover:text-foreground disabled:opacity-30'

export function PageHeader({ title, children }) {
	return (
		<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
			<h1 className="text-2xl font-semibold">{title}</h1>
			<div className="flex flex-wrap items-center gap-2">{children}</div>
		</div>
	)
}

/** Seletor de ano por links (‹ 2026 ›), preservando os outros parâmetros. */
export function YearSwitcher({ basePath, year, params = {} }) {
	const href = (y) => {
		const search = new URLSearchParams({ ...params, ano: String(y) })
		return `${basePath}?${search}`
	}
	return (
		<div className="flex items-center gap-1 text-sm">
			<Link href={href(year - 1)} className={iconButtonClass} aria-label="Ano anterior">‹</Link>
			<span className="min-w-12 text-center font-medium tabular-nums">{year}</span>
			<Link href={href(year + 1)} className={iconButtonClass} aria-label="Próximo ano">›</Link>
		</div>
	)
}

export function Notice({ kind = 'error', children, onClose }) {
	const colors = kind === 'error'
		? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-100'
		: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100'
	return (
		<div role={kind === 'error' ? 'alert' : 'status'} className={`mb-4 flex items-start justify-between gap-3 rounded-md px-3 py-2 text-sm ${colors}`}>
			<span>{children}</span>
			{onClose && <button type="button" onClick={onClose} className="text-xs opacity-70 hover:opacity-100" aria-label="Fechar">✕</button>}
		</div>
	)
}

/** Valor em centavos colorido: negativo em vermelho. */
export function signedClass(cents) {
	return cents < 0 ? 'text-red-600 dark:text-red-400' : ''
}
