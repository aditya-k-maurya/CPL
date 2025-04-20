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
    

    if(status=== 'LT'){
        const query3 = `
            UPDATE audits
            SET assigned_to = 'toran'
            WHERE id = $1
        `

        await pool.query(query3,[audit_id]);
    }
    else if (status === 'CP' || status === 'TBR'){
        const query3 = `
            UPDATE audits
            SET assigned_to = 'none'
            WHERE id = $1
        `

        await pool.query(query3,[audit_id]);
    }
}
const getAllMachinesTBRDb = async function () {

    const query = `
    SELECT * FROM machines
    where audit_status = 'TBR'
    `;
    return await pool.query(query);
}


export {
    getAllMachineDb,
    getAllMachineWithAuditDuesDb,
    updateStatusDb,
    getAllMachinesTBRDb
} 
    
