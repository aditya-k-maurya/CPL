import { getAllMachineDb, getAllMachineWithAuditDuesDb, updateStatusDb , getAllMachinesTBRDb, setAnalysisDataDb} from '../db/machineDb.js'

const getAllMachine = async (req, res) => {
  try {
    let response;
    let allMachines = await getAllMachineDb();
    let machineWithDues = await getAllMachineWithAuditDuesDb();
    let machineTBR = await getAllMachinesTBRDb();
    if(!allMachines || !machineWithDues){
      return res.status(500).json({message:'Unable to fetch machies data'});
    }
    machineTBR = machineTBR.rows;
    allMachines = allMachines.rows;
    machineWithDues = machineWithDues.rows;

	response = {
    "machineTBR" : machineTBR,
		"allMachines": allMachines,
		"machineWithDues" : machineWithDues
	}
    res.status(200).json(response);
  } catch (error) {
    console.log('Failed to fetch all machines: ', error)
    res.status(500).json({message:'Failed to fetch the machines Data'})
  }
}

const updateStatus = async (req, res) => {
  const {machine_id, status, audit_id} = req.body;
  try {
    await updateStatusDb(machine_id,status, audit_id);
    
    res.status(200).json({message:"Status updated successfully"});
  } catch (error) {
    console.log('Error in updating machine status: ', error);
    res.status(500).json({message:'Error in updating machine status'})
  }
}

const setAnalysisData = async (req, res) => {
   const data = req.body
   try {
    await setAnalysisDataDb(data);
    res.status(200).json({message:"Analysis data store successfully"})
   } catch (error) {
      console.log("Error in inserting/updating data: ", error);
      res.status(500).json({message:"Error in inserting/updating analysis data"});
   }
}

export {
    getAllMachine,
    updateStatus,
    setAnalysisData
} 
    
