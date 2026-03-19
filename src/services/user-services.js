import { v4 as uuidv4 } from 'uuid';
// import dbConn from "../../infra/db/database-connection.js"
import { createUser} from '../repositories/user-repository.js'
import AuthUtils from "../utils/auth-utils.js"
import { logInfo } from '../utils/logger.js';

// const db = new dbConn();

export function newUser({login, password, name}){
	
	const uudi = uuidv4()
	const { salt, hash } = AuthUtils.buildHashPwdAndSalt(password);

	// console.log(`salt: ${salt} || hash: ${hash}`);

	const userCreated = createUser({uudi, login, name, hash, salt})

	if (userCreated){
		logInfo(`User ${login} created successful with id ${uudi}`)
	}

}

export async function authUser({login, password}){

	const queryStt = `Select password from summer_users where login = '${login}'`
	const rsHashAndSalt = await db.query(queryStt);
	
	if (!!rsHashAndSalt && rsHashAndSalt.length > 0){

		const [hash,salt] = rsHashAndSalt[0].password.split(':')
		// console.log(`obtido: salt: ${salt} || hash: ${hash}`);
		
		const isValidPassword = AuthUtils.validPassword(password, salt, hash)
		
		if (!isValidPassword){

			throw new Error("Password incorrect");
			
		}

		logInfo(`User autenticated: ${login}`);
		
		return AuthUtils.gerarTokenJWT({login})
		
	}
	
}
