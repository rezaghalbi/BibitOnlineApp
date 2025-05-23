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
          transactionData.shipping_address || null,
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
  static async getFilteredTransactions({ search, status, sort }) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      let query = `
            SELECT 
                t.order_id,
                u.nama_lengkap AS customer_name,
                t.gross_amount,
                t.payment_status,
                t.payment_method,
                t.transaction_time
            FROM transactions t
            JOIN users u ON t.user_id = u.user_id
            WHERE 1=1
        `;

      const params = [];

      if (search) {
        query += ' AND u.nama_lengkap LIKE ?';
        params.push(`%${search}%`);
      }

      if (status !== 'all') {
        query += ' AND t.payment_status = ?';
        params.push(status);
      }

      query +=
        sort === 'terbaru'
          ? ' ORDER BY t.transaction_time DESC'
          : ' ORDER BY t.transaction_time ASC';

      const [rows] = await connection.execute(query, params);
      return rows;
    } finally {
      await connection.end();
    }
  }
  // Di model Transaction
  static async updateByOrderId(orderId, updateData) {
    const connection = await mysql.createConnection(dbConfig); // Tambahkan koneksi
    try {
      // Validasi status
      const allowedStatus = [
        'pending',
        'settlement',
        'capture',
        'deny',
        'cancel',
        'expire',
        'refund',
      ];
      if (!allowedStatus.includes(updateData.payment_status)) {
        throw new Error('Status pembayaran tidak valid');
      }

      // Update database
      const [result] = await connection.execute(
        `UPDATE transactions SET 
          payment_status = ?,
          payment_method = ?,
          transaction_time = ?
          WHERE order_id = ?`,
        [
          updateData.payment_status,
          updateData.payment_method,
          updateData.transaction_time,
          orderId,
        ]
      );
      return result;
    } finally {
      await connection.end(); // Tutup koneksi
    }
  }
}

module.exports = Transaction;
