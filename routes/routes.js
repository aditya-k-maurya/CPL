import express from 'express'
import { login, signUp, getUserByRole, createAudit, getAudit} from '../controller/userController.js';
import {getAllMachine, updateStatus , setAnalysisData} from '../controller/machineController.js'
const router = express.Router();

// user routes

router.post('/api/signUp', signUp);
router.post('/api/login', login);
router.post('/api/user/:role', getUserByRole); // change to get
router.post('/api/createAudit', createAudit);
router.post('/api/getAudit/:username', getAudit) // change to get 

// machine controller

router.post('/api/machines', getAllMachine); // change to get
router.put('/api/updateStatus', updateStatus);
router.post('/api/setAnalysis', setAnalysisData) 


export default router;