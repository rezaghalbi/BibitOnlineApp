const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Transaction {
  static async create(transactionData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Pastikan semua nilai memiliki fallback
      const [result] = await connection.execute(
        `INSERT INTO transactions 
      (order_id, user_id, gross_amount, item_details, payment_status,shipping_address)
      VALUES (?, ?, ?, ?, ?,?)`,
        [
          transactionData.order_id || null,
          transactionData.user_id || null,
          transactionData.gross_amount || 0,
          transactionData.item_details || '[]',
          transactionData.payment_status || 'pending',
          // transactionData.shipping_address || null,
        ]
      );
      return result.insertId;
    } finally {
      await connection.end();
    }
  }

  static async updateStatus(orderId, status) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        `UPDATE transactions SET 
        status = ?, 
        payment_type = ?,
        transaction_time = ?
        WHERE order_id = ?`,
        [
          status.status_code,
          status.payment_type,
          status.transaction_time,
          orderId,
        ]
      );
      return result;
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

  static async countToday() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as total FROM transactions WHERE created_at >= CURDATE()`
    );
    await connection.end();
    return rows[0].total;
  }
  static async updateByOrderId(orderId, status) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'UPDATE transactions SET status = ? WHERE order_id = ?',
        [status, orderId]
      );
      return result;
    } finally {
      await connection.end();
    }
  }

  static async findByOrderId(orderId) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM transactions WHERE order_id = ?',
        [orderId]
      );
      return rows[0];
    } finally {
      await connection.end();
    }
  }

  static async updateStock(items) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      for (const item of items) {
        await connection.execute(
          'UPDATE products SET stok = stok - ? WHERE product_id = ?',
          [item.jumlah, item.product_id]
        );
      }
    } finally {
      await connection.end();
    }
  }
}

module.exports = Transaction;
