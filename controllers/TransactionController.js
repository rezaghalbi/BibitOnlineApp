const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');
const MidtransService = require('../services/midtransService');

class TransactionController {
  // Metode untuk membuat transaksi
  // Metode untuk membuat transaksi
  static async create(req, res) {
    const { metode_pembayaran } = req.body;
    const user_id = req.userId;

    try {
      // Ambil data keranjang
      const cartItems = await Cart.getCartByUserId(user_id);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: 'Keranjang kosong' });
      }

      // Hitung total harga
      const total_harga = cartItems.reduce(
        (total, item) => total + item.harga * item.jumlah,
        0
      );

      // Generate order ID unik
      const order_id = `ORDER-${Date.now()}-${Math.floor(
        Math.random() * 1000
      )}`;

      // Buat transaksi di database
      const transactionId = await Transaction.create({
        user_id,
        total_harga,
        metode_pembayaran,
        status: 'pending',
        order_id, // Tambahkan kolom order_id di tabel transactions
      });

      // Generate Midtrans token
      const paymentToken = await MidtransService.createTransaction({
        order_id,
        gross_amount: total_harga,
        items: cartItems,
        customer: req.user, // Pastikan middleware authUser menyertakan data user
      });

      // Kosongkan keranjang
      for (const item of cartItems) {
        await Cart.deleteFromCart(item.cart_id);
      }

      res.status(201).json({
        message: 'Transaction created successfully',
        transactionId,
        paymentToken,
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(500).json({
        message: 'Error creating transaction',
        error: error.message,
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
  static async handleNotification(req, res) {
    try {
      const notif = req.body;
      const core = new midtransClient.Core({
        isProduction: process.env.MIDTRANS_ENV === 'production',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
      });

      const status = await core.transaction.notification(notif);
      await Transaction.updateStatus(status.order_id, status);

      res.status(200).send('OK');
    } catch (error) {
      console.error('Notification error:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TransactionController;
