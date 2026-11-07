import "dotenv/config";
import app from "./express.js";
import http from "http";

// Falha cedo se faltar configuração essencial (em vez de quebrar na primeira requisição)
for (const name of ['DATABASE_URL', 'SEGREDO_JWT']) {
	if (!process.env[name]) {
		console.error(`Variável de ambiente obrigatória ausente: ${name}`);
		process.exit(1);
	}
}

const port = process.env.PORT || 3000;


http.createServer(app).listen(port, function () {
	console.log(`
    _______          ___              
   / ____(_)___     /   |  ____  ____ 
  / /_  / / __ \\   / /| | / __ \\/ __ \\
 / __/ / / / / /  / ___ |/ /_/ / /_/ /
/_/   /_/_/ /_/  /_/  |_/ .___/ .___/ 
                       /_/   /_/      `)
	console.log(`Servidor escutando na porta: ${port}`);
});

