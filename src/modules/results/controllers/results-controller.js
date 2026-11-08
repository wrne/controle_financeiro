import { getResults } from '../services/results-services.js'

export async function getResultsController(req, res) {
	try {
		res.success(await getResults(req.params.year), 'consult proceed successful.')
	} catch (error) {
		res.error(400, error, 'Failure on getting results')
	}
}
