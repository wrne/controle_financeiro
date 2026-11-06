import {randomBytes, scryptSync, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";

function buildHashPwdAndSalt(password){
	const salt =  randomBytes(16).toString("hex")
	const hash = scryptSync(password, salt, 64).toString("hex");

	// console.log(`salt: ${salt} || hash: ${hash}`);
	
	return { salt, hash }
}


function validPassword(passwordTested, salt, password){

	const hashTest = scryptSync(passwordTested, salt, 64);

	// Para fazer a comparação dos hash, precisamos comparar os Buffers
	const hashReal = Buffer.from(password, "hex");

	const isAuth = timingSafeEqual(hashTest, hashReal);

	return isAuth;
}


function gerarTokenJWT(data) {

	const tokenJwt = jwt.sign(data, process.env.SEGREDO_JWT, { expiresIn: "1h" })

	return {token: tokenJwt};

};


async function verifyTokenJWT(tokenToValidate){

	// traduz token recebido e deve conter propriedade com o login
	const dataToken = await jwt.verify(tokenToValidate, process.env.SEGREDO_JWT)
	return dataToken;	

}

export default {buildHashPwdAndSalt, validPassword, gerarTokenJWT, verifyTokenJWT}