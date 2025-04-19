import { getAllMachineDb, getAllMachineWithAuditDuesDb } from '../db/machineDb.js'

const getAllMachine = async (req, res) => {
  try {
    let response;
    let allMachines = await getAllMachineDb();
    let machineWithDues = await getAllMachineWithAuditDuesDb();
    if(!allMachines || !machineWithDues){
      return res.status(500).send('Unable to fetch machies data');
    }
    allMachines = allMachines.rows;
    machineWithDues = machineWithDues.rows;

	response = {
		"allMachines": allMachines,
		"machineWithDues" : machineWithDues
	}
    res.status(200).json(response);
  } catch (error) {
    console.log('Failed to fetch all machines: ', error)
    res.status(500).send('Failed to fetch the machines Data')
  }
}

const getAllMachineWithAuditDues = async (req, res) => {
    try {
        const res = await getAllMachineWithAuditDuesDb();
        res.status(200).json(res);
    } catch (error) {
        console.log('Failed to fetch machines with dues: ', error)
        res.status(500).send('Failed to fetch the machines dues')
    }
}

export {
    getAllMachine,
    getAllMachineWithAuditDues
} 
    
