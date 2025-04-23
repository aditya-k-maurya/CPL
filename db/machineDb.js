import pool from './pgPool.js';

const getAllMachineDb = async function () {

    const query = 'SELECT * FROM machines';
    return await pool.query(query);
}

const getAllMachineWithAuditDuesDb = async function () {

    const query = `SELECT * 
        FROM machines 
        WHERE CURRENT_DATE >= next_audit_date 
        AND audit_status NOT IN ('FT', 'LT');
    `;
    return await pool.query(query);
}
    
const updateStatusDb = async function (machine_id, status, audit_id) {
    
    const query = `
        UPDATE machines
        SET audit_status = $2
        WHERE name = $1
    `;

    const query2 = `
        UPDATE audits
        SET status = $2
        WHERE id = $1
    `
    await pool.query(query, [machine_id, status]);
    await pool.query(query2, [audit_id, status])
    
    let lt = await pool.query(
        `
            select username from users
            where role = 'LT'
        `
    )
    lt = lt?.rows[0];

    let et = await pool.query(
        `
            select username from users
            where role = 'ET'
        `
    )
    et = et?.rows[0];

    if(status=== 'LT'){
        const query3 = `
            UPDATE audits
            SET assigned_to = $2
            WHERE id = $1
        `

        await pool.query(query3,[audit_id,lt.username]);
    }
    else if (status === 'CP'){
        const query3 = `
            UPDATE audits
            SET assigned_to = 'none'
            WHERE id = $1
        `

        const query4 = `
            UPDATE machines
            SET last_audit_date = now()
            WHERE  name = $1
        `

        const query5 = `
            UPDATE machines
            SET audit_status = $2
            WHERE name = $1
        `
        await pool.query(query3,[audit_id]);
        await pool.query(query4, [machine_id]);
        await pool.query(query5, [machine_id, 'NA'])
    }

    else if(status == 'TBR'){
        const query3 = `
            UPDATE audits
            SET assigned_to = $2
            WHERE id = $1
        `
        await pool.query(query3,[audit_id,et.username]);
    }
}
const getAllMachinesTBRDb = async function () {

    const query = `
    SELECT * FROM machines
    where audit_status = 'TBR'
    `;
    return await pool.query(query);
}

const setAnalysisDataDb = async function (data) {
    let table ;
    if (data.status == 'FT'){
        table = 'field_analysis';
    }else if(data.status == 'LT'){
        table = 'lab_analysis'
    }else{
        table = 'engg_analysis'
    }
    const query = `
    INSERT INTO ${table} (
    audit_id,
    machine_id,
    tested_by,
    analysis_data,
    remark,
    assigned_to,
    assigned_by,
    status,
    machine_type,
    is_health
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `

    return await pool.query(query, [data.audit_id, data.machine_id, data.tested_by, data.analysis_data, data.remark, data.assigned_to, data.assigned_by, data.status, data.machine_type, data.is_health])
}

const getFieldAnalysisDataDb = async function (data) {
    const query = `
        SELECT * FROM field_analysis
        WHERE audit_id = $1
    `
    return await pool.query(query, [data.audit_id])
}

const createMachineDb = async function (data) {
    const query = `
        INSERT INTO machines (name, area, machine_type, audit_frequency, requires_lab_test, health_status, last_audit_date, audit_status)
VALUES
($1, $2, $3, $4, $5, $6, now(), 'NA')
    `
    return await pool.query(query,[data.name,data.area, data.machine_type, data.audit_frequency, data.requires_lab_test, 5]);
}

const getAnalysisDataDb = async function(){
    const query = `
        SELECT 
    f.audit_id,
    f.machine_id,
	f.machine_type,

    f.analysis_data AS field_analysis,
    f.remark AS field_remark,

    l.analysis_data AS lab_analysis,
    l.remark AS lab_remark,

    e.analysis_data AS engg_analysis,
    e.remark AS engg_remark

FROM field_analysis f
LEFT JOIN lab_analysis l ON f.audit_id = l.audit_id
LEFT JOIN engg_analysis e ON f.audit_id = e.audit_id

GROUP BY 
    f.audit_id, 
    f.machine_id, 
	f.machine_type,
    f.analysis_data, 
    f.remark, 
    l.analysis_data, 
    l.remark, 
    e.analysis_data, 
    e.remark
    `

    return await pool.query(query)
}

const machineOnAuditDb = async function() {
    const query = `
        select m.*, a.assigned_to  from 
        audits as a 
        join machines as m on a.machine_id = m.name
    `
    return await pool.query(query);
}


export {
    getAllMachineDb,
    getAllMachineWithAuditDuesDb,
    updateStatusDb,
    getAllMachinesTBRDb,
    setAnalysisDataDb,
    getFieldAnalysisDataDb,
    createMachineDb,
    getAnalysisDataDb,
    machineOnAuditDb
} 
    
