import {newUser, authUser} from "../../services/user-services.js"

export async function newUserController(req, res) {
	
	try {
		const usersAdded = newUser(req.body)
		if (usersAdded < 1)
			throw new Error("User include failed ");
		
		logInfo(`User ${req.body.login} added successful`)
		res.success(null,'user added successful.')
		
	} catch (error) {
		
		res.error(500,error,'User adding failed.');
	}
	
}

export async function authUserController(req, res) {

	try {

		res.success(await authUser(req.body), 'User successful autenticated.')

	} catch (error) {

		res.error(401, error, `User autentication failed`)

	}

}