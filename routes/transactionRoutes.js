const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const { authenticateUser } = require('../middleware/authUser');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk membuat transaksi
router.post('/', authenticateUser, TransactionController.create);

// Rute untuk melihat semua transaksi berdasarkan user_id
router.get(
  '/transaksi',
  authenticateUser,
  TransactionController.getAllByUserId
);

router.get('/getall', authenticateAdmin, TransactionController.getAll);

router.put(
  '/:transaction_id/status',
  authenticateAdmin,
  TransactionController.updateStatus
);

module.exports = router;
