import app from "./express.js";
import http from "http";

const port = process.env.PORT || 3000;


http.createServer(app).listen(port, function () {
	console.log(`Servidor escutando na porta: ${port}`);
});

