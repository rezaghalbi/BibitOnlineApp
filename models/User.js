const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class User {
  static async create(userData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, nama_lengkap, email, no_telepon, alamat) VALUES (?, ?, ?, ?, ?, ?)',
        [
          userData.username,
          userData.password,
          userData.nama_lengkap,
          userData.email,
          userData.no_telepon,
          userData.alamat,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findById(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE user_id = ?',
        [user_id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async update(user_id, userData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'UPDATE users SET username = ?, nama_lengkap = ?, email = ?, no_telepon = ?, alamat = ? WHERE user_id = ?',
        [
          userData.username,
          userData.nama_lengkap,
          userData.email,
          userData.no_telepon,
          userData.alamat,
          user_id,
        ]
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findAll(search = '', sortBy = 'username', order = 'ASC') {
    const connection = await mysql.createConnection(dbConfig);
    try {
      let query = `SELECT * FROM users`;
      const params = [];

      if (search) {
        query += ` WHERE username LIKE ? OR nama_lengkap LIKE ? OR email LIKE ?`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      query += ` ORDER BY ${sortBy} ${order}`;

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }

  static async deleteById(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE user_id = ?',
        [user_id]
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = User;
