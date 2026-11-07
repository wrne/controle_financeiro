/**
 * Erro "esperado" da aplicação: carrega o status HTTP e uma mensagem segura para o cliente.
 * Qualquer outro tipo de erro é tratado como falha interna (500) e não tem a mensagem exposta.
 */
export class AppError extends Error {
	constructor(status, message) {
		super(message)
		this.name = 'AppError'
		this.status = status
	}
}
