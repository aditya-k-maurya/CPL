import { getUser, getUserByRoleDb, createAuditDb, createUserDb, getAuditForMachineDb , getAuditForUserDb } from "../db/userDb.js";
import { getAllMachineDb, getAllMachineWithAuditDuesDb } from "../db/machineDb.js";

const signUp = async (req, res) => {
	const { username, password, role } = req.body;
	try {
		if (!username || !password || !role) {
			return res.status(400).json({ message: "username and password is required!" });
		}

		let user = await getUser(username);
		user = user.rows[0];

		if (user) {
			return res.status(400).json({ message: "username already exists" });
		}

		const response = await createUserDb(username, password, role);
		if (!response) {
			return res.status(500).json({ message: "Failed to create user" });
		}

		user = await getUser(username);
		user = user.rows[0];

		const data = {
			username: user.username,
			password: user.password
		};
		res.status(200).json({ message: "User created successfully", data });
	} catch (error) {
		console.log("Error while Creating user: ", error);
		res.status(500).json({ message: "Error while Creating user" });
	}
};

const login = async (req, res) => {
	const { username, password } = req.body;
	try {
		if (!username || !password) {
			return res.status(400).json({ message: "username and password is required!" });
		}

		let user = await getUser(username);

		if (!user) {
			return res.status(400).json({ message: "username doesn't exist" });
		}
		user = user.rows[0];

		const verifyPassword = (user.password == password);
		if (!verifyPassword) {
			return res.status(400).json({ message: "Invalid Credentials!" });
		}

		const data = {
			username: user.username,
			role: user.role
		};

		res.status(200).json({ message: "Login successful", data });
	} catch (error) {
		console.log("Error while logging: ", error);
		res.status(500).json({ message: "Error while logging" });
	}
};

const getUserByRole = async (req, res) => {
	const role = req.params.role;
	try {
		if (!role) {
			return res.status(400).json({ message: "Role field is required" });
		}

		let response = await getUserByRoleDb(role);
		if (!response) {
			return res.status(500).json({ message: "Unable to fetch user with this role" });
		}

		response = response.rows;
		return res.status(200).json({ message: "Users fetched successfully", data: response });
	} catch (error) {
		console.log("Error in fetching user by role: ", error);
		res.status(500).json({ message: "Error in fetching user by role" });
	}
};

const createAudit = async (req, res) => {
	const { machine_id, assigned_to, assigned_by } = req.body;
	try {
		let isAudit = await getAuditForMachineDb(machine_id);
		isAudit = isAudit?.rows[0];
		if (isAudit) {
			return res.status(200).json({ message: "Audit already exists for the machine" });
		}

		const response = await createAuditDb(machine_id, assigned_to, assigned_by);
		if (!response) {
			return res.status(500).json({ message: "Unable to create audit" });
		}

		return res.status(200).json({ message: "Audit created successfully" });
	} catch (error) {
		console.log("Error in creating audit: ", error);
		res.status(500).json({ message: "Error in creating audit" });
	}
};

const getAudit = async (req, res) => {
	const username = req.params.username;
	try {
		let response = await getAuditForUserDb(username);
		if (!response) {
			return res.status(200).json({ message: "No audits available for the user" });
		}

		response = response.rows;
		return res.status(200).json({ message: "Audits fetched successfully", data: response });
	} catch (error) {
		console.log("Error in fetching audit of the user: ", error);
		res.status(500).json({ message: "Error in fetching audit of the user" });
	}
};

export {
	signUp,
	login,
	getUserByRole,
	createAudit,
	getAudit
};
