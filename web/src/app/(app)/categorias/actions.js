'use server'

import { refresh } from 'next/cache'
import { api } from '@/lib/api'
import { runAction, assertUuid } from '@/lib/action-result'

// Cada ação chama a API (que valida e confere o dono) e atualiza a tela.

const KINDS = ['RECEITA', 'DESPESA']
const CLASSES = ['TRABALHO', 'BASICO', 'INVESTIMENTO']

function cleanName(name) {
	const value = String(name ?? '').trim()
	if (!value || value.length > 40) throw Object.assign(new Error('Validation failed'), { status: 400 })
	return value
}

async function done(fn) {
	const result = await runAction(fn)
	if (result.ok) refresh()
	return result
}

export async function createGroup({ name, kind, resultClass }) {
	return done(() => {
		if (!KINDS.includes(kind)) throw Object.assign(new Error('Validation failed'), { status: 400 })
		const body = { name: cleanName(name), kind }
		if (kind === 'DESPESA') body.resultClass = CLASSES.includes(resultClass) ? resultClass : null
		return api('/category-groups', { method: 'POST', body })
	})
}

export async function updateGroup(id, changes) {
	return done(() => {
		const body = {}
		if ('name' in changes) body.name = cleanName(changes.name)
		if ('resultClass' in changes) body.resultClass = changes.resultClass
		if ('archived' in changes) body.archived = Boolean(changes.archived)
		return api(`/category-groups/${assertUuid(id)}`, { method: 'PUT', body })
	})
}

export async function deleteGroup(id) {
	return done(() => api(`/category-groups/${assertUuid(id)}`, { method: 'DELETE' }))
}

export async function createCategory({ groupId, name }) {
	return done(() => api('/categories', { method: 'POST', body: { groupId: assertUuid(groupId), name: cleanName(name) } }))
}

export async function updateCategory(id, changes) {
	return done(() => {
		const body = {}
		if ('name' in changes) body.name = cleanName(changes.name)
		if ('groupId' in changes) body.groupId = assertUuid(changes.groupId)
		if ('archived' in changes) body.archived = Boolean(changes.archived)
		return api(`/categories/${assertUuid(id)}`, { method: 'PUT', body })
	})
}

export async function deleteCategory(id) {
	return done(() => api(`/categories/${assertUuid(id)}`, { method: 'DELETE' }))
}

/**
 * Nova ordem de grupos ou de categorias de um grupo: grava sortOrder = posição (1, 2, 3...).
 * @param {'groups' | 'categories'} kind
 * @param {{ id: string, sortOrder: number }[]} current ordem atual (para gravar só o que mudou)
 * @param {string[]} orderedIds nova ordem
 */
export async function reorder(kind, current, orderedIds) {
	return done(async () => {
		const path = kind === 'groups' ? '/category-groups' : '/categories'
		const before = new Map(current.map((item) => [assertUuid(item.id), item.sortOrder]))
		for (const [index, id] of orderedIds.entries()) {
			if (before.get(assertUuid(id)) !== index + 1) {
				await api(`${path}/${id}`, { method: 'PUT', body: { sortOrder: index + 1 } })
			}
		}
		return true
	})
}
