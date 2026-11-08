import { Suspense } from 'react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui'
import { GroupsManager } from './groups-manager'

export const metadata = { title: 'Categorias' }

export default function CategoriesPage() {
	return (
		<div>
			<PageHeader title="Grupos e categorias" />
			<p className="mb-4 text-sm text-muted">
				O grupo define em que linha do Resultado as categorias entram. Categoria com orçado não pode ser excluída: arquive.
			</p>
			<Suspense fallback={<p className="text-sm text-muted">Carregando…</p>}>
				<Groups />
			</Suspense>
		</div>
	)
}

async function Groups() {
	const groups = await api('/category-groups?includeArchived=true')
	return <GroupsManager groups={groups ?? []} />
}
