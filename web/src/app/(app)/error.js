'use client'

// Falha ao carregar uma tela (ex.: API fora do ar). O detalhe não é mostrado.
export default function AppError({ reset }) {
	return (
		<div className="rounded-xl border border-line bg-surface p-6">
			<h1 className="mb-2 text-lg font-semibold">Não foi possível carregar esta tela</h1>
			<p className="mb-4 text-sm text-muted">Confira se a API está rodando e tente de novo.</p>
			<button type="button" onClick={() => reset()} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90">
				Tentar de novo
			</button>
		</div>
	)
}
