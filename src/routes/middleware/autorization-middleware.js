import getRolebyUser from '../../utils/auth-utils.js';

/**
 * Middlweware de autorização - Verifica se o usuário tem permissão para acessar a rota solicitada.
 * @param {Array<string>} allowedRoles Define os array permitidos para a rota solicitada
 * @returns 
 */
export default function autorizateMiddleware(allowedRoles) {
  return async (req, res, next) => {
	try {
		// Obtem o role do usuário
		const userRole = await getRolebyUser(req.user)
		if (!allowedRoles.includes(userRole)) {
	
			throw new Error('Route not allowed to this user');
		}
		req.userRole = userRole; // Armazena para uso nas rotas
		next();
		
	} catch (error) {
		return res.error(401, error, 'Not autorized');
		
	}
  };
}
