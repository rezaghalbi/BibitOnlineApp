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
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async getCartByUserId(user_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT c.cart_id, c.jumlah, p.nama_produk, p.harga FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ?',
        [user_id]
      );
      return rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async deleteFromCart(cart_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'DELETE FROM cart WHERE cart_id = ?',
        [cart_id]
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Cart;
