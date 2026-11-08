'use client'

import { useState } from 'react'
import { formatCents, parseBRL } from '@/lib/money'

/**
 * Campo de valor em reais. O usuário digita em pt-BR ("1.234,56"); o componente entrega centavos (123456).
 * - `onChangeCents(cents | null)`: chamado a cada digitação (null = vazio ou inválido).
 * - `name`: se informado, envia os centavos num input oculto (para formulários com Server Action).
 */
export function MoneyInput({ name, defaultCents = null, onChangeCents, id, label, className = '', ...props }) {
	const [text, setText] = useState(defaultCents === null ? '' : formatCents(defaultCents))
	const cents = parseBRL(text)
	const invalid = text.trim() !== '' && cents === null

	function handleChange(event) {
		const value = event.target.value.replace(/[^\d.,\-\sR$]/g, '')
		setText(value)
		onChangeCents?.(parseBRL(value))
	}

	function handleBlur() {
		if (cents !== null) setText(formatCents(cents))
	}

	return (
		<div className="flex flex-col gap-1">
			<div className={`flex items-center rounded-md border bg-surface ${invalid ? 'border-red-500' : 'border-line'} ${className}`}>
				<span className="pl-3 text-sm text-muted">R$</span>
				<input
					id={id}
					aria-label={label}
					aria-invalid={invalid}
					inputMode="decimal"
					autoComplete="off"
					value={text}
					onChange={handleChange}
					onBlur={handleBlur}
					className="w-full bg-transparent px-2 py-2 text-right tabular-nums outline-none"
					{...props}
				/>
			</div>
			{invalid && <span className="text-xs text-red-600">Valor inválido. Use o formato 1.234,56.</span>}
			{name && <input type="hidden" name={name} value={cents ?? ''} />}
		</div>
	)
}
