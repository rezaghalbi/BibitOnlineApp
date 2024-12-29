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

  static async findById(username) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
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

  static async findAll() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute('SELECT * FROM users');
      return rows;
    } catch (error) {
      throw error;
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
