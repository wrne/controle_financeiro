'use client'

import { useState, useTransition } from 'react'
import { Notice, inputClass, buttonClass, primaryButtonClass, iconButtonClass } from '@/components/ui'
import {
	createGroup, updateGroup, deleteGroup, createCategory, updateCategory, deleteCategory, reorder
} from './actions'

const CLASS_LABEL = { TRABALHO: 'Trabalho', BASICO: 'Despesas pessoais (básico)', INVESTIMENTO: 'Investimento' }

function move(list, index, delta) {
	const next = [...list]
	const [item] = next.splice(index, 1)
	next.splice(index + delta, 0, item)
	return next.map((x) => x.id)
}

export function GroupsManager({ groups }) {
	const [error, setError] = useState(null)
	const [showArchived, setShowArchived] = useState(false)
	const [pending, startTransition] = useTransition()

	// Executa uma ação; mostra o erro (se houver) e devolve true em caso de sucesso.
	const run = (fn) => new Promise((resolve) => {
		startTransition(async () => {
			const result = await fn()
			setError(result?.ok ? null : result?.error ?? 'Não foi possível salvar.')
			resolve(Boolean(result?.ok))
		})
	})

	const visibleGroups = groups.filter((g) => showArchived || !g.archivedAt)
	const archivedCount = groups.filter((g) => g.archivedAt).length + groups.flatMap((g) => g.categories).filter((c) => c.archivedAt).length

	return (
		<div className={pending ? 'opacity-70 transition-opacity' : ''} aria-busy={pending}>
			{error && <Notice onClose={() => setError(null)}>{error}</Notice>}

			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<NewGroupForm run={run} />
				<label className="flex items-center gap-2 text-sm text-muted">
					<input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
					Mostrar arquivados ({archivedCount})
				</label>
			</div>

			<div className="flex flex-col gap-4">
				{visibleGroups.map((group, index) => (
					<GroupCard
						key={group.id}
						group={group}
						groups={groups}
						showArchived={showArchived}
						run={run}
						canMoveUp={index > 0}
						canMoveDown={index < visibleGroups.length - 1}
						onMove={(delta) => run(() => reorder('groups', groups, move(visibleGroups, index, delta)))}
					/>
				))}
				{visibleGroups.length === 0 && <p className="text-sm text-muted">Nenhum grupo cadastrado.</p>}
			</div>
		</div>
	)
}

function NewGroupForm({ run }) {
	const [name, setName] = useState('')
	const [kind, setKind] = useState('DESPESA')
	const [resultClass, setResultClass] = useState('BASICO')

	async function submit(event) {
		event.preventDefault()
		if (await run(() => createGroup({ name, kind, resultClass }))) setName('')
	}

	return (
		<form onSubmit={submit} className="flex flex-wrap items-center gap-2">
			<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Novo grupo" maxLength={40} required aria-label="Nome do novo grupo" className={inputClass} />
			<select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Tipo" className={inputClass}>
				<option value="DESPESA">Despesa</option>
				<option value="RECEITA">Receita</option>
			</select>
			{kind === 'DESPESA' && (
				<select value={resultClass} onChange={(e) => setResultClass(e.target.value)} aria-label="Classificação no Resultado" className={inputClass}>
					{Object.entries(CLASS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
				</select>
			)}
			<button type="submit" className={primaryButtonClass}>Criar grupo</button>
		</form>
	)
}

function GroupCard({ group, groups, showArchived, run, canMoveUp, canMoveDown, onMove }) {
	const [newCategory, setNewCategory] = useState('')
	const archived = Boolean(group.archivedAt)
	const categories = group.categories.filter((c) => showArchived || !c.archivedAt)

	async function addCategory(event) {
		event.preventDefault()
		if (await run(() => createCategory({ groupId: group.id, name: newCategory }))) setNewCategory('')
	}

	function confirmDelete() {
		if (window.confirm(`Excluir o grupo "${group.name}"?`)) run(() => deleteGroup(group.id))
	}

	return (
		<section className={`rounded-xl border border-line bg-surface ${archived ? 'opacity-60' : ''}`}>
			<header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
				<div className="flex flex-col">
					<button type="button" className={iconButtonClass} disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label={`Subir grupo ${group.name}`}>▲</button>
					<button type="button" className={iconButtonClass} disabled={!canMoveDown} onClick={() => onMove(1)} aria-label={`Descer grupo ${group.name}`}>▼</button>
				</div>
				<InlineName name={group.name} label="grupo" onSave={(name) => run(() => updateGroup(group.id, { name }))} className="text-base font-semibold" />
				<span className="rounded bg-background px-2 py-0.5 text-xs text-muted">{group.kind === 'RECEITA' ? 'Receita' : 'Despesa'}</span>
				{group.kind === 'DESPESA' && (
					<select
						value={group.resultClass ?? ''}
						onChange={(e) => run(() => updateGroup(group.id, { resultClass: e.target.value }))}
						aria-label={`Classificação do grupo ${group.name}`}
						className={`${inputClass} py-0.5 text-xs`}
					>
						{Object.entries(CLASS_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
					</select>
				)}
				{archived && <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Arquivado</span>}
				<div className="ml-auto flex gap-2">
					<button type="button" className={buttonClass} onClick={() => run(() => updateGroup(group.id, { archived: !archived }))}>
						{archived ? 'Desarquivar' : 'Arquivar'}
					</button>
					<button type="button" className={buttonClass} onClick={confirmDelete} disabled={group.categories.length > 0} title={group.categories.length > 0 ? 'Só é possível excluir um grupo sem categorias' : undefined}>
						Excluir
					</button>
				</div>
			</header>

			<ul className="divide-y divide-line">
				{categories.map((category, index) => (
					<CategoryRow
						key={category.id}
						category={category}
						group={group}
						groups={groups}
						run={run}
						canMoveUp={index > 0}
						canMoveDown={index < categories.length - 1}
						onMove={(delta) => run(() => reorder('categories', group.categories, move(categories, index, delta)))}
					/>
				))}
				{categories.length === 0 && <li className="px-4 py-2 text-sm text-muted">Sem categorias.</li>}
			</ul>

			{!archived && (
				<form onSubmit={addCategory} className="flex gap-2 border-t border-line px-4 py-3">
					<input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Nova categoria" maxLength={40} required aria-label={`Nova categoria em ${group.name}`} className={`${inputClass} flex-1`} />
					<button type="submit" className={buttonClass}>Adicionar</button>
				</form>
			)}
		</section>
	)
}

function CategoryRow({ category, group, groups, run, canMoveUp, canMoveDown, onMove }) {
	const archived = Boolean(category.archivedAt)
	const targets = groups.filter((g) => g.id !== group.id && !g.archivedAt && g.kind === group.kind)

	function confirmDelete() {
		if (window.confirm(`Excluir a categoria "${category.name}"?`)) run(() => deleteCategory(category.id))
	}

	return (
		<li className={`flex flex-wrap items-center gap-2 px-4 py-1.5 ${archived ? 'opacity-60' : ''}`}>
			<button type="button" className={iconButtonClass} disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label={`Subir ${category.name}`}>▲</button>
			<button type="button" className={iconButtonClass} disabled={!canMoveDown} onClick={() => onMove(1)} aria-label={`Descer ${category.name}`}>▼</button>
			<InlineName name={category.name} label="categoria" onSave={(name) => run(() => updateCategory(category.id, { name }))} className="text-sm" />
			{archived && <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Arquivada</span>}
			<div className="ml-auto flex flex-wrap items-center gap-2">
				{targets.length > 0 && (
					<select
						value=""
						onChange={(e) => e.target.value && run(() => updateCategory(category.id, { groupId: e.target.value }))}
						aria-label={`Mover ${category.name} para outro grupo`}
						className={`${inputClass} py-0.5 text-xs`}
					>
						<option value="">Mover para…</option>
						{targets.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
					</select>
				)}
				<button type="button" className={iconButtonClass} onClick={() => run(() => updateCategory(category.id, { archived: !archived }))}>
					{archived ? 'Desarquivar' : 'Arquivar'}
				</button>
				<button type="button" className={iconButtonClass} onClick={confirmDelete}>Excluir</button>
			</div>
		</li>
	)
}

/** Nome com edição no lugar: clique em "Renomear", Enter salva, Esc cancela. */
function InlineName({ name, label, onSave, className = '' }) {
	const [editing, setEditing] = useState(false)
	const [value, setValue] = useState(name)

	async function save() {
		const trimmed = value.trim()
		if (!trimmed || trimmed === name) {
			setEditing(false)
			setValue(name)
			return
		}
		if (await onSave(trimmed)) setEditing(false)
	}

	if (!editing) {
		return (
			<span className={`flex items-center gap-1 ${className}`}>
				{name}
				<button type="button" className={iconButtonClass} onClick={() => { setValue(name); setEditing(true) }} aria-label={`Renomear ${label} ${name}`}>✎</button>
			</span>
		)
	}

	return (
		<input
			autoFocus
			value={value}
			maxLength={40}
			onChange={(e) => setValue(e.target.value)}
			onBlur={save}
			onKeyDown={(e) => {
				if (e.key === 'Enter') { e.preventDefault(); save() }
				if (e.key === 'Escape') { setValue(name); setEditing(false) }
			}}
			aria-label={`Novo nome da ${label}`}
			className={`${inputClass} ${className}`}
		/>
	)
}
