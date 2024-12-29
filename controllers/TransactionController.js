const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');

class TransactionController {
  // Metode untuk membuat transaksi
  static async create(req, res) {
    const { metode_pembayaran } = req.body; // Ambil metode pembayaran dari body
    const user_id = req.userId; // Ambil userId dari token JWT

    // Validasi input
    if (typeof metode_pembayaran === 'undefined') {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    try {
      // Ambil item dari keranjang
      const cartItems = await Cart.getCartByUserId(user_id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Cart is empty' });
      }

      // Hitung total harga
      const total_harga = cartItems.reduce(
        (total, item) => total + item.harga * item.jumlah,
        0
      );

      // Buat transaksi
      const transactionId = await Transaction.create({
        user_id,
        total_harga,
        metode_pembayaran,
        status: 'pending', // Status awal adalah pending
      });

      // Kosongkan keranjang
      for (const item of cartItems) {
        await Cart.deleteFromCart(item.cart_id);
      }

      res
        .status(201)
        .json({ message: 'Transaction created successfully', transactionId });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        message: 'Error creating transaction',
        error: error.message || error,
      });
    }
  }

  // Metode untuk melihat semua transaksi berdasarkan user_id
  static async getAllByUserId(req, res) {
    const user_id = req.userId; // Ambil userId dari token JWT

    try {
      const transactions = await Transaction.findAllByUserId(user_id);
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({
        message: 'Error fetching transactions',
        error: error.message || error,
      });
    }
  }
}

module.exports = TransactionController;
