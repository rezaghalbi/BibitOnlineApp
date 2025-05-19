const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class Product {
  static async create(productData) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'INSERT INTO products (nama_produk, deskripsi, harga, stok, admin_id, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
          productData.nama_produk,
          productData.deskripsi,
          productData.harga,
          productData.stok,
          productData.admin_id,
          productData.image_url, // Menyimpan URL gambar
        ]
      );
      return result.insertId; // Mengembalikan ID produk yang baru dibuat
    } catch (error) {
      console.error('Error in Product.create:', error); // Debugging
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
      console.error('Error in Product.findAll:', error); // Debugging
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
      return rows[0]; // Mengembalikan produk yang ditemukan
    } catch (error) {
      console.error('Error in Product.findById:', error); // Debugging
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async update(product_id, data) {
    const connection = await mysql.createConnection(dbConfig); // pastikan ini sudah ada
    try {
      const { nama_produk, deskripsi, harga, stok, image_url } = data;

      const query = `
      UPDATE products 
      SET nama_produk = ?, deskripsi = ?, harga = ?, stok = ?, image_url = ?
      WHERE product_id = ?
    `;

      const values = [
        nama_produk,
        deskripsi,
        harga,
        stok,
        image_url,
        product_id,
      ];

      console.log('🔎 Update values:', values); // debug tambahan
      const [result] = await connection.execute(query, values);
      return result;
    } catch (error) {
      console.error('Error in Product.update:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }

  static async delete(product_id) {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [result] = await connection.execute(
        'DELETE FROM products WHERE product_id = ?',
        [product_id]
      );
      return result;
    } catch (error) {
      console.error('Error in Product.delete:', error);
      throw error;
    } finally {
      await connection.end();
    }
  }
  static async count() {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT COUNT(*) as total FROM products'
    );
    await connection.end();
    return rows[0].total;
  }
}

module.exports = Product;
