import { v4 as uuidv4 } from 'uuid';
// import dbConn from "../../infra/db/database-connection.js"
import { createUser, getPasswordByLogin, getuserIdByLogin} from '../repositories/user-repository.js'
import AuthUtils from "../utils/auth-utils.js"
import { logInfo } from '../utils/logger.js';

// const db = new dbConn();

export async function newUser({login, password, name, role}){
	
	const uudi = uuidv4()
	const { salt, hash } = await AuthUtils.buildHashPwdAndSalt(password);

	// console.log(`salt: ${salt} || hash: ${hash}`);

	const userCreated = await createUser({uudi, login, name, role, hash, salt})

	if (userCreated){
		logInfo(`User ${login} created successful with id ${uudi}`)
	}
	return userCreated

}

export async function authUser({login, password}){

	const rsHashAndSalt = await getPasswordByLogin(login)
	
	if (!!rsHashAndSalt && rsHashAndSalt.length > 0){

		const [hash,salt] = rsHashAndSalt.split(':')
		// console.log(`obtido: salt: ${salt} || hash: ${hash}`);
		
		const isValidPassword = await AuthUtils.validPassword(password, salt, hash)
		
		if (!isValidPassword){

			throw new Error("Password incorrect");
			
		}

		logInfo(`User autenticated: ${login}`);
		
		return AuthUtils.gerarTokenJWT({login})
		
	}
	
}

export async function getUserId(login){
	return await getuserIdByLogin(login)
}
