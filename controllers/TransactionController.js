const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');
const MidtransService = require('../services/midtransService');
const Product = require('../models/Product');
const midtransClient = require('midtrans-client'); // <-- Tambahkan ini di paling atas

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
  // Metode untuk user (getAllByUserId) - Tambah filter
  static async getFilteredTransactions(params) {
    try {
      const transactions = await Transaction.getFilteredTransactions(params);
      return transactions.map((transaction) => ({
        ...transaction,
        transaction_time: new Date(transaction.transaction_time).toISOString(),
      }));
    } catch (error) {
      throw new Error('Failed to fetch transactions');
    }
  }
  // Metode untuk melihat semua transaksi (admin)
  static async getAll(req, res) {
    try {
      const { search = '', status = 'all', sort = 'terbaru' } = req.query;

      const transactions = await Transaction.getFilteredTransactions({
        search,
        status,
        sort,
      });

      res.status(200).json({
        status: 'success',
        data: transactions,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Gagal mengambil data transaksi',
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
      const notification = req.body;

      // Inisialisasi Core API
      const coreApi = new midtransClient.CoreApi({
        isProduction: process.env.MIDTRANS_ENV === 'production',
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      // Dapatkan status terbaru
      const status = await coreApi.transaction.status(notification.order_id);

      // Update transaksi
      await Transaction.updateByOrderId(status.order_id, {
        payment_status: status.transaction_status,
        payment_method: status.payment_type,
        transaction_time: status.transaction_time,
      });
      // Jika pembayaran 'deny','cancel','expire','refund'
      if (
        status.transaction_status === 'deny' ||
        status.transaction_status === 'cancel' ||
        status.transaction_status === 'expire' ||
        status.transaction_status === 'refund'
      ) {
        // update status transaksi di database
        await Transaction.updateByOrderId(status.order_id, {
          payment_status: status.transaction_status,

          transaction_time: status.transaction_time,
        });
      }

      // Jika pembayaran sukses
      if (status.transaction_status === 'settlement') {
        const transaction = await Transaction.findByOrderId(status.order_id);
        const items = JSON.parse(transaction.item_details);

        for (const item of items) {
          await Product.updateStock(item.id, item.quantity);
        }
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('Notification error:', {
        error: error.message,
        stack: error.stack,
        notification: req.body,
      });
      res.status(500).json({
        error: 'Gagal memproses notifikasi',
        details: error.message,
      });
    }
  }
  static async getSnapToken(req, res) {
    try {
      const { orderId } = req.params;
      const transaction = await Transaction.findByOrderId(orderId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }

      if (transaction.payment_status !== 'pending') {
        return res.status(400).json({ message: 'Transaksi sudah diproses' });
      }

      res.json({
        token: transaction.snap_token,
        redirect_url: transaction.redirect_url,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  static async getTransactionDetail(req, res) {
    try {
      const { orderId } = req.params;
      const transaction = await Transaction.findByOrderId(orderId);

      if (!transaction) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }

      res.json({
        status: 'success',
        data: {
          ...transaction,
          item_details: JSON.parse(transaction.item_details),
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // get transaction by user id
  static async getTransactionByUserId(req, res) {
    try {
      const user_id = req.userId;
      const transactions = await Transaction.findAllByUserId(user_id);

      if (!transactions) {
        return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
      }

      res.json({
        status: 'success',
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = TransactionController;
