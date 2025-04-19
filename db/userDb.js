import pool from './pgPool.js';


const getUser = async function (username) {

    const query = `SELECT * FROM users
                WHERE username = $1 `;
    return await pool.query(query,[username]);

}

const getUserByRoleDb = async function (role = 'FT'){
    const query = `SELECT username FROM users
    WHERE role = $1
    `
    return await pool.query(query, [role]);
}

const createAuditDb = async function (machines_id, assigned_to, assigned_by) {

    const query = `INSERT INTO audits (
    machines_id,
    assigned_to,
    assigned_by,
    status
) VALUES ( $1, $2, $3, 'FT');
    `;
    return await pool.query(query, values);
}

export {
    getUser,
    getUserByRoleDb,
    createAuditDb,
} 
    
