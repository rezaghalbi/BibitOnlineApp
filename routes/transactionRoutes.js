const express = require('express');
const TransactionController = require('../controllers/TransactionController');
const { authenticateUser } = require('../middleware/authUser');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk membuat transaksi
router.post('/', authenticateUser, TransactionController.create);

// routes/transactionRoutes.js

// Endpoint admin (tambahkan query params)
router.get('/admin', authenticateAdmin, TransactionController.getAll);

// Endpoint user (tambahkan query params)
router.get('/user', authenticateUser, TransactionController.getAllByUserId);
router.get(
  '/:orderId',
  authenticateUser,
  TransactionController.getTransactionDetail
);
router.get(
  '/:orderId/token',
  authenticateUser,
  TransactionController.getSnapToken
);

router.put(
  '/:transaction_id/status',
  authenticateAdmin,
  TransactionController.updateStatus
);
router.get('/count', authenticateAdmin, async (req, res) => {
  try {
    const count = await Transaction.getCount();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ message: 'Error getting transaction count' });
  }
});
router.get('/recent', authenticateAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.getRecent(5);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error getting recent transactions' });
  }
});

// File: routes/transactionRoutes.js
router.post(
  '/notification',
  express.json({ type: 'application/json' }),
  TransactionController.handleNotification
);

module.exports = router;
