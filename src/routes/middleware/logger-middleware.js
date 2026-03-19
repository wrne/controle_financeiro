import {logInfo} from '../../utils/logger.js';
/**
 * Middlweware para logar requisições HTTP.
 * Executado a quando recepciona cada requisição. Antes dos demais middlewares.
 * @param {import('express').Request} req - Objeto de solicitação HTTP.
 * @param {import('express').Response} res - Objeto de resposta HTTP.
 * @param {import('express').NextFunction} next - Função para chamar o próximo middleware.
 */
export default function httpReqLogger(req, res, next) {

  logInfo(	
`--REQ--------------------------------------------------
Acess: ${req.hostname} ${req.user}
Request: ${req.method} ${req.originalUrl}
Body: ${JSON.stringify(req.body)}
--END REQ----------------------------------------------`);
  next();
}
