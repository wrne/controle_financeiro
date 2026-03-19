import express from "express";
import {createExpressLoggerContext} from "./utils/logger.js"
import bodyParser from "body-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json"  with { type: 'json' };;

import privateRoutes from "./routes/private-routes.js";
import publichRoutes from "./routes/public-routes.js";
import responseFormatter from "./routes/middleware/return-messages-middleware.js"

const app = express();

// app.use(function(req, res, next) {
	//   res.header("Access-Control-Allow-Origin", "*");
	//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	//   next();
	// });
	
app.use(bodyParser.json());
app.use(responseFormatter);
app.use(helmet());

app.use(createExpressLoggerContext);
	// Rota para a documentação da API
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotas que não necesistam autenticação
app.use( publichRoutes );
// Rotas que necessitam autenticação
app.use( privateRoutes );

export default app;
