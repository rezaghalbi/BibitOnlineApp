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

  // Metode untuk mengambil semua transaksi berdasarkan user_id
  static async findAllByUserId(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE user_id = ?',
        [user_id]
      );
      return rows; // Mengembalikan semua transaksi untuk user_id yang diberikan
    } catch (error) {
      throw error; // Melemparkan error jika terjadi kesalahan
    } finally {
      await connection.end(); // Menutup koneksi
    }
  }
  // Metode untuk mengambil semua transaksi (admin)
  static async findAll() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute('SELECT * FROM transactions');
      return rows; // Mengembalikan semua transaksi
    } catch (error) {
      throw error; // Melemparkan error jika terjadi kesalahan
    } finally {
      await connection.end(); // Menutup koneksi
    }
  }
  // Metode untuk memperbarui status transaksi
  static async updateStatus(transactionId, status) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'UPDATE transactions SET status = ? WHERE transaction_id = ?',
        [status, transactionId]
      );
      return result; // Mengembalikan hasil dari query update
    } catch (error) {
      throw error; // Melemparkan error jika terjadi kesalahan
    } finally {
      await connection.end(); // Menutup koneksi
    }
  }
  static async countToday() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as total FROM transactions WHERE created_at >= CURDATE()`
    );
    await connection.end();
    return rows[0].total;
  }
}

module.exports = Transaction;
