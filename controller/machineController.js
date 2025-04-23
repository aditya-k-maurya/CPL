import { getAllMachineDb, getAllMachineWithAuditDuesDb,getAnalysisDataDb,machineOnAuditDb, updateStatusDb , getAllMachinesTBRDb, setAnalysisDataDb ,getFieldAnalysisDataDb, createMachineDb} from '../db/machineDb.js'
import { createNotificationDb } from '../db/notificationDb.js'


const createMachine = async (req, res) => {
  let data = req.body
  try {
    if(!data.audit_frequency){
      if(data.machine_type = 'Transformer'){
        data.audit_frequency = 30
      }else{
        data.audit_frequency = 90
      }
    }
    if(!data.health_status){
      data.health_status = 5;
    }
    if(data.machine_type = 'Transformer'){
      data.requires_lab_test = true
    }else{
      data.requires_lab_test = false
    }

    data.last_audit_date = Date.now();
    data.audit_status = 'NA'
    let response;
    response = await createMachineDb(data)
    
    res.status(200).json({message: "Machine created successfully"});
  } catch (error) {
    console.log('Failed to create machine: ', error)
    res.status(500).json({message:'Failed to create machine'})
  }
}


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

    machineWithDues = machineWithDues.filter((item) => item.audit_status =='NA');

    let machineOnAudits = await machineOnAuditDb();
    machineOnAudits = machineOnAudits?.rows.filter((item) => item.audit_status != 'NA')

	response = {
    "machineTBR" : machineTBR,
		"allMachines": allMachines,
		"machineWithDues" : machineWithDues,
    "machineOnAudit": machineOnAudits
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
    const assigned_by = await getAssignedByFromAuditDb(audit_id);
    await createNotificationDb(assigned_by, `There is update in audit status of machine ${machine_id}`)
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
    if(data.is_health){
      if(data.status == 'LT'){
        let health = await getFieldAnalysisDataDb(data);
        health = health?.rows[0];
        if(health?.is_health){
          await updateStatusDb(data.machine_id, 'CP', data.audit_id);

        }else{
          await updateStatusDb(data.machine_id, 'TBR', data.audit_id);
        }
      }
      else if(data.machine_type== 'Compressor'){
        await updateStatusDb(data.machine_id, 'CP', data.audit_id);
      }else if(data.status=='FT'){
        await updateStatusDb(data.machine_id, 'LT', data.audit_id);
      }else{
        await updateStatusDb(data.machine_id, 'CP', data.audit_id);
      }
    }else{
      if(data.status == 'FT' && data.machine_type=='Transformer'){
        await updateStatusDb(data.machine_id, 'LT', data.audit_id);
      }else{
        await updateStatusDb(data.machine_id, 'TBR', data.audit_id);
      }
    }
    await createNotificationDb(data.assigned_to, `Analysis data saved successfully for machine ${data.machine_id}`)
    await createNotificationDb(data.assigned_by, `New audit data availabe for machine ${data.machine_id}` )
    res.status(200).json({message:"Analysis data store successfully"})
   } catch (error) {
      console.log("Error in inserting/updating data: ", error);
      res.status(500).json({message:"Error in inserting/updating analysis data"});
   }
}

const getAnalysisData = async (req, res) => {
  try {
    let response = await getAnalysisDataDb();
    if(response.rowCount ==0){
      return res.status(200).json({message:"No data to display"})
    }
    response = response.rows;

    const CompressorData = response.filter(item => item.machine_type === 'Compressor');
    const TransformerData = response.filter(item => item.machine_type === 'Transformer');
    
    const data = {
      "Compressor": CompressorData,
      "Transformer": TransformerData
    };

    return res.status(200).json(data)
   } catch (error) {
      console.log("Error in fetching analysis data: ", error);
      res.status(500).json({message:"Error in fetching analysis data"});
   }
}

export {
    getAllMachine,
    updateStatus,
    setAnalysisData,
    createMachine,
    getAnalysisData
} 
    
