const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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
      const user = await User.findById(username);

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
    const userId = req.userId; // Ambil userId dari token JWT
    const { username, nama_lengkap, email, no_telepon, alamat } = req.body;

    // Validasi input
    if (!username || !nama_lengkap || !email || !no_telepon || !alamat) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    try {
      const result = await User.update(userId, {
        username,
        nama_lengkap,
        email,
        no_telepon,
        alamat,
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({
        message: 'Error updating profile',
        error: error.message || error,
      });
    }
  }
}

module.exports = UserController;
