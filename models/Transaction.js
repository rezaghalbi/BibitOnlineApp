const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Transaction {
  static async create(transactionData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO transactions (user_id, tanggal_transaksi, total_harga, metode_pembayaran, status) VALUES (?, NOW(), ?, ?, ?)',
        [
          transactionData.user_id,
          transactionData.total_harga,
          transactionData.metode_pembayaran,
          transactionData.status,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findAllByUserId(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE user_id = ?',
        [user_id]
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Transaction;
