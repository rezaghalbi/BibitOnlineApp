const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Cart {
  static async addToCart(cartData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO cart (user_id, product_id, jumlah) VALUES (?, ?, ?)',
        [cartData.user_id, cartData.product_id, cartData.jumlah]
      );
      return result.insertId;
    } finally {
      await connection.end();
    }
  }

  static async deleteFromCart(cart_id, user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'DELETE FROM cart WHERE cart_id = ? AND user_id = ?',
        [cart_id, user_id]
      );
      return result;
    } finally {
      await connection.end();
    }
  }

  static async getCartByUserId(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        `SELECT 
          c.cart_id, 
          c.product_id,
          c.jumlah,
          p.nama_produk,
          p.harga,
          p.image_url
        FROM cart c
        JOIN products p ON c.product_id = p.product_id
        WHERE c.user_id = ? AND c.is_checkedout = 0`,
        [user_id]
      );
      return rows;
    } finally {
      await connection.end();
    }
  }

  static async updateQuantity(cart_id, user_id, jumlah) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        `UPDATE cart 
        SET jumlah = ?
        WHERE cart_id = ? AND user_id = ?`,
        [jumlah, cart_id, user_id]
      );
      return result.affectedRows;
    } finally {
      await connection.end();
    }
  }
  static async updateCheckoutStatus(user_id, snap_token) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      // Validasi parameter
      if (!user_id || !snap_token) {
        throw new Error('Parameter tidak valid untuk updateCheckoutStatus');
      }

      console.log('Params:', [snap_token, user_id]); // Debugging

      const [result] = await connection.execute(
        'UPDATE cart SET is_checkedout = 1, snap_token = ? WHERE user_id = ?',
        [snap_token, user_id]
      );
      return result;
    } catch (error) {
      console.error('Error di updateCheckoutStatus:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Cart;
