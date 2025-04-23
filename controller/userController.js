import { getUser, getUserByRoleDb, createAuditDb, createUserDb, getAuditForMachineDb, getAuditForUserDb, getAllUsersDb } from "../db/userDb.js";
import { getAllMachineDb } from "../db/machineDb.js";
import { createNotificationDb } from "../db/notificationDb.js";

const signUp = async (req, res) => {
	const { username, password, role } = req.body;
	try {
		if (!username || !password || !role) {
			return res.status(400).json({ message: "username and password is required!" });
		}

		let user = await getUser(username);
		user = user.rows[0];

		if (user) {
			return res.status(400).json({ message: "Username already exists exists, please choose a different username" });
		}

		const response = await createUserDb(username, password, role);
		if (!response) {
			return res.status(500).json({ message: 'Failed to create user' });
		}

		user = await getUser(username);
		user = user.rows[0];

		await createNotificationDb(username, "Welcome! We congratulate you to become part of our orgainzation!");
		const data = {
			username: user.username,
			password: user.password
		};
		res.status(200).json({ message: 'User created successfully', data });
	} catch (error) {
		console.log('Error while Creating user: ', error);
		res.status(500).json({ message: 'Error while Creating user' });
	}
};

const login = async (req, res) => {
	const data = req.body;
	try {
		if (!data.username || !data.password) {
			return res.status(400).json({ message: 'username and password is required!' });
		}
		let username = data.username;
		let password = data.password;

		let user = await getUser(username);

		if (!user) {
			return res.status(400).json({ message: "username doesn't exists" });
		}
		user = user.rows[0];

		const verifyPassword = (user.password == password);
		if (!verifyPassword) {
			return res.status(400).json({ message: 'Invalid Credientials!' });
		}

		const data = {
			username: user.username,
			role: user.role
		};

		res.status(200).json(data);
	} catch (error) {
		console.log('Error while logging: ', error);
		res.status(500).json({ message: 'Error while logging' });
	}
};

const getUserByRole = async (req, res) => {
	const role = req.params.role;
	try {
		if (!role) {
			return res.status(500).json({ message: 'Role field is required' });
		}

		let response = await getUserByRoleDb(role);
		if (!response) {
			return res.status(500).json({ message: 'Unable to fetch user with this role' });
		}

		response = response.rows;
		return res.status(200).json(response);
	} catch (error) {
		console.log('Error in fetching user by role: ', error);
		res.status(500).json({ message: 'Error in fetching user by role' });
	}
};

const createAudit = async (req, res) => {
	const { machine_id, assigned_to, assigned_by } = req.body;
	try {
		let isAudit = await getAuditForMachineDb(machine_id);

		if (isAudit.rowCount > 0) {
			for (const audit of isAudit.rows) {
				if (audit.status !== 'CP') {
					return res.status(200).json({ message: 'Audit already exists for the machine' });
				}
			}
		}

		const response = await createAuditDb(machine_id, assigned_to, assigned_by);
		await createNotificationDb(assigned_to, `You have been assigned a new audit by ${assigned_by} to machine ${machine_id}`)
		await createNotificationDb(assigned_to, `Machine ${machine_id} audit has been assigned to ${assigned_to}`)
		if (!response) {
			return res.status(500).json({ message: 'Unable to create audit' });
		}

		return res.status(200).json({ message: 'Audit created successfully' });
	} catch (error) {
		console.log('Error in creating audit: ', error);
		res.status(500).json({ message: 'Error in creating audit' });
	}
};

const getAudit = async (req, res) => {
	const username = req.params.username;
	try {
		let response = await getAuditForUserDb(username);
		if (!response) {
			return res.status(200).json({ message: 'No audits availabe for the user' });
		}

		response = response.rows;
		return res.status(200).json(response);
	} catch (error) {
		console.log('Error in fetching audit of the user: ', error);
		res.status(500).json({ message: 'Error in fetching audit of the user' });
	}
};

const getDashboard = async (req, res) => {
	try {
		let allMachines = await getAllMachineDb();
		let criticalMachines = allMachines.rows.filter(
			(item) => item.health_status !== undefined && item.health_status < 3
		);
	
		let safeIndex = allMachines.rows.length > 0
			? 100 - ((criticalMachines.length / allMachines.rows.length) * 100)
			: 100;
		
		const fieldTechnician = await getUserByRoleDb('FT');
		const labTechnician = await getUserByRoleDb('LT')
		const enggTechnician = await getUserByRoleDb('ET')

		const totalTech = fieldTechnician.rowCount + labTechnician.rowCount + enggTechnician.rowCount;

		let uniqueAreas = new Set(allMachines.rows.map(machine => machine.area));

		let uniqueAreaCount = uniqueAreas.size;

		let totalMachinesOnAudit = allMachines.rows.filter((item) => item.audit_status != 'NA')

		let data = {
			"inventory": allMachines.rowCount,
			"criticalMachines": criticalMachines.length,
			"safeIndex": safeIndex.toFixed(2),
			"availableTechnician": totalTech,
			"totalSites": uniqueAreaCount,
			"totalMachinesOnAudit": totalMachinesOnAudit.length
		}

		res.status(200).json(data)
	} catch (error) {
		console.log("Error in fetching dashboard", error);
		res.status(500).json({message: "Error in fetching dashboard"});
	}

}

const getAllUsers = async (req, res) => {
	try {
		const response = await getAllUsersDb();
		if(!response?.rowCount){
			res.status(200).json({message:"No User present"});
		}
		const roleMap = {
			'AD': 'Admin',
			'SP': 'Supervisor',
			'FT': 'Field Technician',
			'LT': 'Lab Technician',
			'ET': 'Engineer Technician',
		}

		const modifiedData = response.rows.map(user => ({
			...user,
			role: roleMap[user.role] || 'Field Technician', // fallback to abbreviation if not found
		  }));
		return res.status(200).json(modifiedData);
	} catch (error) {
		console.log('Error in fetching users', error);
		res.status(500).json({message: "Error in fetching user"});
	}
}

export {
	signUp,
	login,
	getUserByRole,
	createAudit,
	getAudit,
	getDashboard,
	getAllUsers
};
