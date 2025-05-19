const express = require('express');
const UserController = require('../controllers/UserController');
const { authenticateUser } = require('../middleware/authUser');
const { authenticateAdmin } = require('../middleware/authAdmin');


const router = express.Router();

// Rute untuk registrasi
router.post('/register', UserController.register);

// Rute untuk login
router.post('/login', UserController.login);

// Rute untuk mengedit profil (dengan otentikasi)
router.put('/profile', authenticateUser, UserController.editProfile);

router.get('/count', authenticateAdmin, async (req, res) => {
  try {
    const count = await User.getCount();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting user count' });
  }
});

module.exports = router;
