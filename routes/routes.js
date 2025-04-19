import express from 'express'
import { login, getUserByRole, createAudit } from '../controller/userController.js';
import {getAllMachine, getAllMachineWithAuditDues} from '../controller/machineController.js'
const router = express.Router();


// user routes

router.post('/api/login', login);
router.get('/api/user/:role', getUserByRole);
router.post('/api/createAudit', createAudit);


// machine controller

router.get('/api/machines', getAllMachine);
router.get('/api/machinesDue', getAllMachineWithAuditDues);

export default router