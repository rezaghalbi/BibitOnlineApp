const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const { authenticateUser } = require('../middleware/authUser');

const router = express.Router();

// Rute untuk membuat transaksi
router.post('/', authenticateUser, TransactionController.create);

// Rute untuk melihat semua transaksi berdasarkan user_id
router.get('/', authenticateUser, TransactionController.getAllByUserId);

module.exports = router;
