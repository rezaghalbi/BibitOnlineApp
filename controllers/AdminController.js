const Admin = require('../models/Admin');
const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class AdminController {
  // Metode untuk registrasi admin
  static async register(req, res) {
    const { username, password, nama_lengkap, email } = req.body;

    // Validasi input
    if (!username || !password || !nama_lengkap || !email) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const adminId = await Admin.create({
        username,
        password: hashedPassword,
        nama_lengkap,
        email,
      });

      res.status(201).json({ message: 'Admin created successfully', adminId });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({
        message: 'Error creating admin',
        error: error.message || error,
      });
    }
  }

  // Metode untuk login admin
  static async login(req, res) {
    const { username, password } = req.body;

    try {
      const admin = await Admin.findByUsername(username);
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { adminId: admin.admin_id },
        process.env.ADMIN_JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getRecentTransactions(req, res) {
    try {
      const transactions = await Transaction.findRecent(5);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }

  // Metode untuk melihat semua pengguna
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        message: 'Error fetching users',
        error: error.message || error,
      });
    }
  }

  // Metode untuk menghapus pengguna berdasarkan ID
  static async deleteUser(req, res) {
    const { user_id } = req.params;

    try {
      const result = await User.deleteById(user_id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        message: 'Error deleting user',
        error: error.message || error,
      });
    }
  }

  // Metode untuk mencari pengguna berdasarkan ID
  static async getUserById(req, res) {
    const { user_id } = req.params;

    try {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        message: 'Error fetching user',
        error: error.message || error,
      });
    }
  }
  static async getStats(req, res) {
    let connection;
    try {
      connection = await mysql.createConnection(dbConfig);

      // Debugging: Log queries sebelum eksekusi
      console.log('Executing stats queries...');

      const [productsResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM products'
      );
      const [transactionsResult] = await connection.execute(
        `SELECT COUNT(*) as total FROM transactions `
      );
      const [usersResult] = await connection.execute(
        'SELECT COUNT(*) as total FROM users'
      );

      // Debugging: Log hasil query
      console.log('Products count:', productsResult[0].total);
      console.log('Transactions count:', transactionsResult[0].total);
      console.log('Users count:', usersResult[0].total);

      res.json({
        success: true,
        data: {
          products: productsResult[0].total,
          transactions: transactionsResult[0].total,
          users: usersResult[0].total,
        },
      });
    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics',
        error: error.message,
      });
    } finally {
      if (connection) await connection.end();
    }
  }
}

module.exports = AdminController;
