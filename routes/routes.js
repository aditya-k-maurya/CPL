import express from 'express'
import { login, signUp, getUserByRole, createAudit, getAudit, getDashboard, getAllUsers} from '../controller/userController.js';
import {getAllMachine, updateStatus , setAnalysisData, createMachine, getAnalysisData} from '../controller/machineController.js'
import { getNotifications, markReadNotification, markReadNotificationById } from '../controller/notificationController.js';
const router = express.Router();

// user routes

router.post('/api/signUp', signUp);
router.post('/api/login', login);
router.post('/api/user/:role', getUserByRole); // change to get
router.post('/api/createAudit', createAudit);
router.post('/api/getAudit/:username', getAudit); // change to get 
router.post('/api/getDashboard' ,getDashboard);
router.post('/api/getAllUsers', getAllUsers);

// machine controller

router.post('/api/createMachine', createMachine);
router.post('/api/machines', getAllMachine); // change to get
router.put('/api/updateStatus', updateStatus);
router.post('/api/setAnalysis', setAnalysisData) 
router.post('/api/getAllAnalysis', getAnalysisData)

// notification
router.post('/api/getNotification/:username', getNotifications)
router.post('/api/markReadNotification', markReadNotification)
router.post('/api/markReadNotificationById', markReadNotificationById)

export default router;