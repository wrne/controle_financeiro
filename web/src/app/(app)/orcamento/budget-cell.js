'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCents, parseBRL } from '@/lib/money'

const NOTE_MAX = 500

/**
 * Célula de valor editável. Clique (ou Enter) abre a edição; Enter ou sair do campo salva; Esc cancela.
 * Vazio = sem orçado (remove). Durante a edição: "→" salva e replica para os meses seguintes; "💬" abre o comentário.
 * Célula com comentário tem uma marca no canto e mostra o texto ao passar o mouse.
 * onSave(cents), onReplicate(cents, changed) e onSaveNote(text) devolvem true quando deu certo.
 */
export function BudgetCell({ value, note = null, onSave, onReplicate, onSaveNote, disabled = false, label, wide = false }) {
	const [editing, setEditing] = useState(false)
	const [text, setText] = useState('')
	const [saving, setSaving] = useState(false)
	const [noteOpen, setNoteOpen] = useState(false)

	const parsed = text.trim() === '' ? null : parseBRL(text)
	const invalid = text.trim() !== '' && parsed === null

	function open() {
		if (disabled) return
		setText(value === null ? '' : formatCents(value))
		setEditing(true)
	}

	async function save() {
		if (invalid) return
		if (parsed === value) {
			setEditing(false)
			return
		}
		setSaving(true)
		const ok = await onSave(parsed)
		setSaving(false)
		if (ok) setEditing(false)
	}

	async function replicate() {
		if (invalid) return
		setSaving(true)
		const ok = await onReplicate(parsed, parsed !== value)
		setSaving(false)
		if (ok) setEditing(false)
	}

	// Salva o valor digitado (se mudou) e abre o comentário.
	async function openNote() {
		if (invalid) return
		if (parsed !== value) {
			setSaving(true)
			const ok = await onSave(parsed)
			setSaving(false)
			if (!ok) return
		}
		setEditing(false)
		setNoteOpen(true)
	}

	const width = wide ? 'w-40' : 'w-24'
	const dialog = noteOpen && (
		<NoteDialog
			label={label}
			note={note}
			onClose={() => setNoteOpen(false)}
			onSave={async (newNote) => {
				const ok = await onSaveNote(newNote)
				if (ok) setNoteOpen(false)
				return ok
			}}
		/>
	)

	if (!editing) {
		return (
			<>
				<button
					type="button"
					onClick={open}
					aria-disabled={disabled || undefined}
					title={note ?? undefined}
					aria-label={`${label}: ${value === null ? 'sem orçado' : formatCents(value)}${note ? `. Comentário: ${note}` : ''}`}
					className={`relative ${width} rounded px-1.5 py-1 text-right tabular-nums ${disabled ? 'cursor-default' : 'hover:bg-background'} ${value === null ? 'text-muted' : ''}`}
				>
					{value === null ? '·' : formatCents(value)}
					{note && <span aria-hidden="true" className="absolute right-0 top-0 h-0 w-0 border-l-[7px] border-t-[7px] border-l-transparent border-t-amber-500" />}
				</button>
				{dialog}
			</>
		)
	}

	return (
		<span className={`inline-flex items-center gap-0.5 ${saving ? 'opacity-60' : ''}`}>
			<input
				autoFocus
				value={text}
				inputMode="decimal"
				onChange={(e) => setText(e.target.value.replace(/[^\d.,\-\sR$]/g, ''))}
				onFocus={(e) => e.target.select()}
				onBlur={save}
				onKeyDown={(e) => {
					if (e.key === 'Enter') { e.preventDefault(); save() }
					if (e.key === 'Escape') setEditing(false)
				}}
				disabled={saving}
				aria-label={label}
				aria-invalid={invalid}
				title={invalid ? 'Valor inválido. Use o formato 1.234,56' : 'Enter salva · Esc cancela · vazio remove'}
				className={`${width} rounded border bg-surface px-1.5 py-1 text-right tabular-nums outline-none ${invalid ? 'border-red-500' : 'border-accent'}`}
			/>
			{onReplicate && (
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={replicate}
					disabled={saving || invalid}
					title="Salvar e replicar para os meses seguintes"
					aria-label={`Replicar ${label} para os meses seguintes`}
					className="rounded px-1 text-xs text-accent hover:bg-background disabled:opacity-40"
				>
					→
				</button>
			)}
			{onSaveNote && (
				<button
					type="button"
					onMouseDown={(e) => e.preventDefault()}
					onClick={openNote}
					disabled={saving || invalid}
					title={note ? 'Editar comentário' : 'Adicionar comentário'}
					aria-label={`Comentário de ${label}`}
					className="rounded px-1 text-xs hover:bg-background disabled:opacity-40"
				>
					💬
				</button>
			)}
		</span>
	)
}

/** Caixa de diálogo nativa (fica por cima de tudo, sem ser cortada pela área com rolagem da grade). */
function NoteDialog({ label, note, onSave, onClose }) {
	const ref = useRef(null)
	const [text, setText] = useState(note ?? '')
	const [saving, setSaving] = useState(false)

	// Abre como modal ao montar. Sem close() na limpeza: no modo de desenvolvimento o React monta, desmonta e
	// remonta (StrictMode), e o close() dispararia o evento "close", que fecharia a caixa logo depois de abrir.
	// Ao sair da tela, o elemento é removido e o modal some junto.
	useEffect(() => {
		const dialog = ref.current
		if (dialog && !dialog.open) dialog.showModal()
	}, [])

	async function submit(newNote) {
		setSaving(true)
		await onSave(newNote)
		setSaving(false)
	}

	return (
		<dialog
			ref={ref}
			onClose={onClose}
			onCancel={(e) => { e.preventDefault(); onClose() }}
			className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-line bg-surface p-0 text-foreground shadow-xl backdrop:bg-black/40"
		>
			<form method="dialog" onSubmit={(e) => { e.preventDefault(); submit(text) }} className="flex flex-col gap-3 p-4">
				<h2 className="font-medium">Comentário <span className="font-normal text-muted">· {label}</span></h2>
				<textarea
					autoFocus
					value={text}
					maxLength={NOTE_MAX}
					rows={4}
					onChange={(e) => setText(e.target.value)}
					aria-label={`Comentário de ${label}`}
					placeholder="Ex.: reajuste a partir de abril"
					className="w-full rounded-md border border-line bg-surface px-2 py-1.5 text-sm"
				/>
				<div className="flex items-center justify-between gap-2">
					<span className="text-xs text-muted tabular-nums">{text.length}/{NOTE_MAX}</span>
					<div className="flex gap-2">
						{note && (
							<button type="button" onClick={() => submit(null)} disabled={saving} className="rounded-md px-3 py-1.5 text-sm text-red-600 hover:bg-background disabled:opacity-50">
								Remover
							</button>
						)}
						<button type="button" onClick={onClose} disabled={saving} className="rounded-md border border-line px-3 py-1.5 text-sm hover:bg-background disabled:opacity-50">
							Cancelar
						</button>
						<button type="submit" disabled={saving} className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
							Salvar
						</button>
					</div>
				</div>
			</form>
		</dialog>
	)
}
