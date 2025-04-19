import {getUser , getUserByRoleDb, createAuditDb} from "../db/userDb.js";
import { getAllMachineDb , getAllMachineWithAuditDuesDb} from "../db/machineDb.js";


const login = async (req, res) => {
	const { username, password } = req.body;

	if (!username || !password) {
		return res.status(400).send('username and password is required!')
	}

	let user = await getUser(username);

	if (!user) {
		return res.status(400).send("username doesn't exists");
	}
	user = user.rows[0]
	const verifyPassword = (user.password == password);

	if (!verifyPassword) {
		return res.status(400).send('Invalid Credientials!')
	}

	const data = {
		username : user.username,
		role: user.role
	}

	res.status(200).json(user)
};

const getUserByRole = async(req, res) => {
	const role = req.params.role;
	if(!role){
		return res.status(500).sent('Role field is required');
	}
	let response  = await getUserByRoleDb(role);
	if(!response){
		return res.status(500).send('Unable to fetch user with this role')
	}
	response = response.rows;
	return res.status(200).json(response);
}

const createAudit = async(req, res) => {
	const {machine_id, assigned_to, assigned_by } = req.body;
	const response  = await createAuditDb(role);
	if(!response){
		return res.status(500).send('Unable to fetch user with this role')
	}
	return res.status(200).json(response);
}

export {
	login,
	getUserByRole,
	createAudit
}