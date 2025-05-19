const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Admin {
  static async create(adminData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO admins (username, password, nama_lengkap, email) VALUES (?, ?, ?, ?)',
        [
          adminData.username,
          adminData.password,
          adminData.nama_lengkap,
          adminData.email,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findByUsername(username) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM admins WHERE username = ?',
        [username]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Admin;
