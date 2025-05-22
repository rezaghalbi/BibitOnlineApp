const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

class UserController {
  // Metode untuk registrasi pengguna
  static async register(req, res) {
    const { username, password, nama_lengkap, email, no_telepon, alamat } =
      req.body;

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await User.create({
        username,
        password: hashedPassword,
        nama_lengkap,
        email,
        no_telepon,
        alamat,
      });

      res.status(201).json({ message: 'User created successfully', userId });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        message: 'Error creating user',
        error: error.message || error,
      });
    }
  }

  // Metode untuk login pengguna
  static async login(req, res) {
    const { username, password } = req.body;

    try {
      const user = await User.findByUsername(username);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error logging in:', error);
      res
        .status(500)
        .json({ message: 'Error logging in', error: error.message || error });
    }
  }

  // Metode untuk mengedit profil pengguna
  static async editProfile(req, res) {
    const userId = req.userId;
    const { username, nama_lengkap, email, no_telepon, alamat, newPassword } =
      req.body;

    // Validasi input
    if (!username || !nama_lengkap || !email || !no_telepon || !alamat) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    try {
      const connection = await mysql.createConnection(dbConfig);

      // Check jika username/email sudah dipakai oleh user lain
      const [existing] = await connection.execute(
        `SELECT * FROM users 
             WHERE (username = ? OR email = ?) 
             AND user_id != ?`,
        [username, email, userId]
      );

      if (existing.length > 0) {
        await connection.end();
        return res.status(400).json({
          message: 'Username atau email sudah digunakan',
        });
      }

      // Update data
      let updateQuery = `UPDATE users SET 
            username = ?, 
            nama_lengkap = ?, 
            email = ?, 
            no_telepon = ?, 
            alamat = ?`;

      const params = [username, nama_lengkap, email, no_telepon, alamat];

      // Update password jika ada
      if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updateQuery += ', password = ?';
        params.push(hashedPassword);
      }

      updateQuery += ' WHERE user_id = ?';
      params.push(userId);

      const [result] = await connection.execute(updateQuery, params);

      if (result.affectedRows === 0) {
        await connection.end();
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      await connection.end();
      res.json({ message: 'Profil berhasil diperbarui' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        message: 'Error updating profile',
        error: error.message,
      });
    }
  }
  static async getAllUsers(req, res) {
    try {
      const { search, sortBy, order } = req.query;

      let query = 'SELECT * FROM users';
      const params = [];

      // Handle search
      if (search) {
        query +=
          ' WHERE username LIKE ? OR nama_lengkap LIKE ? OR email LIKE ?';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      // Handle sorting
      if (
        sortBy &&
        ['username', 'nama_lengkap', 'created_at'].includes(sortBy)
      ) {
        const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${sortBy} ${sortOrder}`;
      }

      const connection = await mysql.createConnection(dbConfig);
      const [users] = await connection.execute(query, params);
      await connection.end();

      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update user
  static async updateUser(req, res) {
    const { user_id } = req.params;
    try {
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      const updatedUser = await User.update(user_id, req.body);
      res.status(200).json({
        message: 'User berhasil diperbarui',
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete user
  static async deleteUser(req, res) {
    const { user_id } = req.params;
    try {
      const result = await User.deleteById(user_id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }
      res.status(200).json({ message: 'User berhasil dihapus' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // Di UserController tambahkan method ini
  static async getUserById(req, res) {
    try {
      const { user_id } = req.params;
      const user = await User.findById(user_id);

      if (!user) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  static async getUserProfile(req, res) {
    const userId = req.userId;

    try {
      const connection = await mysql.createConnection(dbConfig);
      const [rows] = await connection.execute(
        `SELECT 
                user_id,
                username,
                nama_lengkap,
                email,
                no_telepon,
                alamat
                
            FROM users 
            WHERE user_id = ?`,
        [userId]
      );
      await connection.end();

      if (rows.length === 0) {
        return res.status(404).json({ message: 'User tidak ditemukan' });
      }

      const userData = rows[0];
      res.status(200).json(userData);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({
        message: 'Gagal mengambil data profil',
        error: error.message,
      });
    }
  }
}

module.exports = UserController;
