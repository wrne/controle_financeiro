import app from "./express.js";
import http from "http";

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

