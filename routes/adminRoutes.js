const express = require('express');
const AdminController = require('../controllers/AdminController');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk registrasi admin
router.post('/register', AdminController.register);

router.post('/login', AdminController.login);

// Rute untuk melihat semua pengguna
router.get('/users', authenticateAdmin, AdminController.getAllUsers);

// Rute untuk menghapus pengguna berdasarkan ID
router.delete('/users/:user_id', authenticateAdmin, AdminController.deleteUser);

// Rute untuk mencari pengguna berdasarkan ID
router.get('/users/:user_id', authenticateAdmin, AdminController.getUserById);

module.exports = router;
