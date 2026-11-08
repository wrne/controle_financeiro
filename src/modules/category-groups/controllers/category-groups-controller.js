import { logInfo } from '../../../utils/logger.js'
import { listGroups, getGroup, createGroup, updateGroup, deleteGroup } from '../services/category-groups-services.js'

export async function listGroupsController(req, res) {
	try {
		res.success(await listGroups(req.query), 'consult proceed successful.')
	} catch (error) {
		res.error(400, error, 'Failure on getting groups')
	}
}

export async function getGroupController(req, res) {
	try {
		res.success(await getGroup(req.params.id), 'consult proceed successful.')
	} catch (error) {
		res.error(400, error, 'Failure on getting group')
	}
}

export async function createGroupController(req, res) {
	try {
		const group = await createGroup(req.body)
		logInfo(`category group created successful`)
		res.success(group, 'group created successful.')
	} catch (error) {
		res.error(400, error, 'Failure on creating group')
	}
}

export async function updateGroupController(req, res) {
	try {
		const group = await updateGroup(req.params.id, req.body)
		logInfo(`category group updated successful`)
		res.success(group, 'group updated successful.')
	} catch (error) {
		res.error(400, error, 'Failure on updating group')
	}
}

export async function deleteGroupController(req, res) {
	try {
		const group = await deleteGroup(req.params.id)
		logInfo(`category group deleted successful`)
		res.success(group, 'group deleted successful.')
	} catch (error) {
		res.error(400, error, 'Failure on deleting group')
	}
}
