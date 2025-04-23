import pool from './pgPool.js';

const getUser = async function (username) {

    const query = `SELECT * FROM users
                WHERE username = $1 `;
    return await pool.query(query,[username]);
}

const createUserDb = async function (username, password, role){
    const query =  `INSERT INTO users (username, password, role)
    VALUES
    ($1, $2, $3) `;
    return await pool.query(query, [username, password, role]);
}

const getUserByRoleDb = async function (role = 'FT'){
    const query = `SELECT username FROM users
        WHERE role = $1
    `
    return await pool.query(query, [role]);
}

const createAuditDb = async function (machine_id, assigned_to, assigned_by) {
    const query = `
      INSERT INTO audits (
        machine_id,
        assigned_to,
        assigned_by,
        status,
        machine_type
      )
      VALUES (
        $1,
        $2,
        $3,
        'FT',
        (SELECT machine_type FROM machines WHERE name = $1)
      )
    `;

    const query2 = `
        UPDATE machines
        SET audit_status = 'FT'
        WHERE name = $1
    `

    await pool.query(query2,[machine_id]);
    
    return await pool.query(query, [machine_id, assigned_to, assigned_by]);

  };
  

const getAuditForUserDb = async function(username){
    const query = `select * from audits
        where assigned_to = $1`;
    return await pool.query(query,[username])
}

const getAuditForMachineDb = async function (machine_id) {
    const query = `select * from audits
        where machine_id = $1`
    return await pool.query(query, [machine_id]);
}

const getAssignedByFromAuditDb = async function (audit_id) {
    const query = `select assigned_by from audits
        where id = $1
    `
    return await pool.query(query,[audit_id])
}

const getAllUsersDb = async function (){
    const query = `
        select * from users 
    `

    return await pool.query(query);
}

export {
    getUser,
    getUserByRoleDb,
    createAuditDb,
    createUserDb,
    getAuditForMachineDb,
    getAuditForUserDb,
    getAssignedByFromAuditDb,
    getAllUsersDb
} 
    
