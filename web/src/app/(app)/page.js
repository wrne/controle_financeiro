import { Suspense } from 'react'
import { api } from '@/lib/api'
import { MoneyDemo } from './money-demo'

export const metadata = { title: 'Início' }

export default function HomePage() {
	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold">Início</h1>

			<section className="rounded-xl border border-line bg-surface p-5">
				<h2 className="mb-2 font-medium">Conexão com a API</h2>
				<Suspense fallback={<p className="text-sm text-muted">Consultando…</p>}>
					<ApiStatus />
				</Suspense>
			</section>

			<section className="max-w-sm rounded-xl border border-line bg-surface p-5">
				<h2 className="mb-2 font-medium">Entrada de valores</h2>
				<MoneyDemo />
			</section>
		</div>
	)
}

async function ApiStatus() {
	const categories = await api('/categories')
	const total = Array.isArray(categories) ? categories.length : 0
	return <p className="text-sm">API conectada. {total} categoria(s) cadastrada(s) neste login.</p>
}
