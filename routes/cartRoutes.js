const express = require('express');
const { authenticateUser } = require('../middleware/authUser');
const CartController = require('../controllers/CartController');


const router = express.Router();

// Rute untuk membuat transaksi
router.post('/', authenticateUser, CartController.addToCart);
router.get('/', authenticateUser, CartController.getCart);
router.put('/:cart_id', authenticateUser, CartController.updateCartItem);
router.delete('/:cart_id', authenticateUser, CartController.deleteFromCart);
router.post('/checkout', authenticateUser, CartController.checkoutCart);

module.exports = router;
