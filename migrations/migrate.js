require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

async function migrate() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    // Membuat tabel users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, -- Pastikan untuk menggunakan hashing yang aman saat menyimpan
        nama_lengkap VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        no_telepon VARCHAR(20),
        alamat TEXT
      )
    `);

    // Membuat tabel admins
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL, -- Pastikan untuk menggunakan hashing yang aman saat menyimpan
        nama_lengkap VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL
      )
    `);

    // Membuat tabel products
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        product_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_produk VARCHAR(255) NOT NULL,
        deskripsi TEXT,
        harga DECIMAL(10, 2) NOT NULL,
        stok INT NOT NULL,
        gambar VARCHAR(255),
        admin_id INT,
        FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
      )
    `);

    // Membuat tabel cart
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS cart (
        cart_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        product_id INT,
        jumlah INT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
      )
    `);

    // Membuat tabel transactions
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        transaction_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        tanggal_transaksi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_harga DECIMAL(10, 2) NOT NULL,
        metode_pembayaran VARCHAR(50),
        status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      )
    `);

    console.log("Migrasi berhasil! Tabel telah dibuat.");
  } catch (error) {
    console.error("Gagal melakukan migrasi:", error);
  } finally {
    await connection.end();
  }
}

migrate();
