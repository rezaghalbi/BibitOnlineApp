const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Product {
  static async create(productData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO products (nama_produk, deskripsi, harga, stok, admin_id) VALUES (?, ?, ?, ?, ?)',
        [
          productData.nama_produk,
          productData.deskripsi,
          productData.harga,
          productData.stok,
          productData.admin_id,
        ]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findAll() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute('SELECT * FROM products');
      return rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async findById(product_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM products WHERE product_id = ?',
        [product_id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async update(product_id, productData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'UPDATE products SET nama_produk = ?, deskripsi = ?, harga = ?, stok = ? WHERE product_id = ?',
        [
          productData.nama_produk,
          productData.deskripsi,
          productData.harga,
          productData.stok,
          product_id,
        ]
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async deleteById(product_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'DELETE FROM products WHERE product_id = ?',
        [product_id]
      );
      return result;
    } catch (error) {
      throw error;
    } finally {
      await connection.end();
    }
  }
}

module.exports = Product;
