// Mensagens da API (em inglês, para quem integra) traduzidas para a tela.

const KNOWN = [
	[/^category is in use/, 'A categoria tem orçado ou lançamentos. Arquive em vez de excluir.'],
	[/^group has categories/, 'O grupo tem categorias. Mova ou exclua as categorias, ou arquive o grupo.'],
	[/^Duplicate record/, 'Já existe um item com esse nome aqui.'],
	[/^category is archived/, 'A categoria está arquivada. Desarquive para editar o orçado.'],
	[/^group is archived/, 'O grupo está arquivado.'],
	[/^(category|group) not found/, 'Não encontrado. Talvez já tenha sido excluído; recarregue a página.'],
	[/^RECEITA groups have no resultClass/, 'Grupo de receita não tem classificação.'],
	[/^DESPESA groups require a resultClass/, 'Escolha a classificação do grupo de despesa.'],
	[/^Validation failed/, 'Dados inválidos. Confira os campos.']
]

/**
 * @param {unknown} error ApiError (status, message) ou erro de rede
 * @param {string} [fallback]
 */
export function friendlyError(error, fallback = 'Não foi possível salvar. Tente de novo.') {
	const message = typeof error?.message === 'string' ? error.message : ''
	for (const [pattern, text] of KNOWN) {
		if (pattern.test(message)) return text
	}
	if (error?.status === 403) return 'Ação não permitida.'
	return fallback
}
