const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middleware/authUser');

const router = express.Router();

// Rute untuk registrasi
router.post('/register', UserController.register);

// Rute untuk login
router.post('/login', UserController.login);

// Rute untuk mengedit profil (dengan otentikasi)
router.put('/profile', authenticateUser, UserController.editProfile);

module.exports = router;
