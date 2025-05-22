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


// routes/transactionRoutes.js
router.post('/notification', TransactionController.handleNotification);

module.exports = router;
