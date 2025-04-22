import pool from './pgPool.js';

const createNotificationDb = async (username, message) => {
    const query = `
      INSERT INTO notifications (username, message)
      VALUES ($1, $2)
    `;
    return await pool.query(query, [username, message]);
};
  
const getNotificationsDb = async (username) => {
    const query = `
      SELECT * FROM notifications
      WHERE username = $1
      ORDER BY created_at DESC
    `;
    return await pool.query(query, [username]);

};
  
const markReadNotificationDb = async (username) => {
    const query = `
        UPDATE notifications
    SET is_read = true
    WHERE username = $1
    `
    return await pool.query(query,[username]);
}

export {
    createNotificationDb,
    getNotificationsDb,
    markReadNotificationDb
} 
    
