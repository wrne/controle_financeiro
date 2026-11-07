import express from "express";
import cors from "cors";
import {createExpressLoggerContext} from "./utils/context-utils.js";
import { AppError } from "./utils/app-error.js";
import bodyParser from "body-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json"  with { type: 'json' };;

import privateRoutes from "./modules/private-routes.js";
import publichRoutes from "./modules/public-routes.js";
import responseFormatter from "./modules/middleware/return-messages-middleware.js"

const app = express();

// Atrás de proxy/túnel (Cloudflare Tunnel, Nginx...) defina TRUST_PROXY=1 para o rate limit enxergar o IP real.
// Não defina se a API estiver exposta diretamente (o IP poderia ser forjado).
if (process.env.TRUST_PROXY) {
	app.set('trust proxy', /^\d+$/.test(process.env.TRUST_PROXY) ? Number(process.env.TRUST_PROXY) : process.env.TRUST_PROXY);
}

app.use(helmet());
app.use(responseFormatter);

// CORS: só é necessário se um navegador chamar a API diretamente (ex.: Next.js no cliente).
// Defina CORS_ORIGINS com as origens permitidas, separadas por vírgula. Sem a variável, o CORS fica desligado.
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
if (corsOrigins.length > 0) {
	app.use(cors({
		origin: corsOrigins,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Authorization', 'Content-Type'],
		maxAge: 600
	}));
}

app.use(bodyParser.json({ limit: '100kb' }));

app.use(createExpressLoggerContext);
	// Rota para a documentação da API
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas que não necesistam autenticação
app.use( publichRoutes );
// Rotas que necessitam autenticação
app.use( privateRoutes );

// Rota inexistente
app.use((req, res) => res.error(404, new AppError(404, 'Route not found.'), 'Not found'));

// Erros não tratados (ex.: JSON inválido no corpo da requisição)
app.use((err, req, res, next) => {
	if (err?.type === 'entity.parse.failed') return res.error(400, new AppError(400, 'Invalid JSON body.'), 'Bad request');
	if (err?.type === 'entity.too.large') return res.error(413, new AppError(413, 'Request body too large.'), 'Bad request');
	return res.error(500, err, 'Internal error.');
});

export default app;
