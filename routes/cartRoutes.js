const express = require('express');
const { authenticateUser } = require('../middleware/authUser');
const CartController = require('../controllers/CartController');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk membuat transaksi
router.post('/', authenticateUser, CartController.addToCart);
router.get('/', authenticateUser, CartController.getCart);
router.delete('/:cart_id', authenticateAdmin, CartController.deleteFromCart);

module.exports = router;
