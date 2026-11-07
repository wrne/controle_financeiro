import { v4 as uuidv4 } from 'uuid';
import { createUser, getPasswordByLogin, getuserIdByLogin} from '../repositories/user-repository.js'
import AuthUtils from "../../../utils/auth-utils.js"
import { AppError } from '../../../utils/app-error.js'
import { logInfo } from '../../../utils/logger.js';

// Hash de mentira usado quando o login não existe, para que o tempo de resposta
// seja parecido com o de um login existente (evita descobrir usuários pelo tempo).
const DUMMY = AuthUtils.buildHashPwdAndSalt('dummy-password')

export async function newUser({login, password, name, role}){
	
	const uudi = uuidv4()
	const { salt, hash } = await AuthUtils.buildHashPwdAndSalt(password);

	const userCreated = await createUser({uudi, login, name, role, hash, salt})

	if (userCreated){
		logInfo(`User ${login} created successful with id ${uudi}`)
	}
	return userCreated

}

export async function authUser({login, password}){

	const invalidCredentials = new AppError(401, 'Invalid login or password.')

	const rsHashAndSalt = await getPasswordByLogin(login)

	if (!rsHashAndSalt){
		AuthUtils.validPassword(password, DUMMY.salt, DUMMY.hash)
		throw invalidCredentials
	}

	const [hash,salt] = rsHashAndSalt.split(':')

	if (!AuthUtils.validPassword(password, salt, hash)){
		throw invalidCredentials
	}

	logInfo(`User autenticated: ${login}`);

	return AuthUtils.gerarTokenJWT({login})

}

export async function getUserId(login){
	return await getuserIdByLogin(login)
}
