const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');

class TransactionController {
  // Metode untuk membuat transaksi
  // Metode untuk membuat transaksi
  static async create(req, res) {
    const { metode_pembayaran } = req.body; // Mengambil metode pembayaran dari body
    const user_id = req.userId; // Ambil userId dari token JWT

    // Validasi input
    if (!metode_pembayaran) {
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
        status: 'pending',
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
  // Metode untuk melihat semua transaksi (admin)
  static async getAll(req, res) {
    try {
      const transactions = await Transaction.findAll(); // Ambil semua transaksi
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      res.status(500).json({
        message: 'Error fetching all transactions',
        error: error.message || error,
      });
    }
  }
  // Metode untuk memperbarui status transaksi
  static async updateStatus(req, res) {
    const { transaction_id } = req.params; // Ambil ID transaksi dari parameter URL
    const { status } = req.body; // Ambil status baru dari body permintaan

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    try {
      const updatedTransaction = await Transaction.updateStatus(
        transaction_id,
        status
      );
      if (updatedTransaction.affectedRows === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      res
        .status(200)
        .json({ message: 'Transaction status updated successfully' });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({
        message: 'Error updating transaction status',
        error: error.message || error,
      });
    }
  }
}

module.exports = TransactionController;
