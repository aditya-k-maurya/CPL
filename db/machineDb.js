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

export {
    getAllMachineDb,
    getAllMachineWithAuditDuesDb,
} 
    
