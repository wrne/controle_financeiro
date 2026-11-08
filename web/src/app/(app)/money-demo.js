'use client'

import { useState } from 'react'
import { MoneyInput } from '@/components/money-input'
import { formatBRL } from '@/lib/money'

// Conferência temporária da entrada de valores. Sai quando a grade de orçamento (Entrega 1) existir.
export function MoneyDemo() {
	const [cents, setCents] = useState(null)

	return (
		<div className="flex flex-col gap-2">
			<MoneyInput label="Valor de teste" onChangeCents={setCents} />
			<p className="text-sm text-muted">
				Centavos: <code className="tabular-nums">{cents ?? '—'}</code>
				{cents !== null && <> · Formatado: <span className="tabular-nums">{formatBRL(cents)}</span></>}
			</p>
		</div>
	)
}
