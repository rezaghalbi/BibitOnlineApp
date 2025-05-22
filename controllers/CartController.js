const Cart = require('../models/Cart');
const Product = require('../models/Product');
const midtransClient = require('midtrans-client');
const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');
const Transaction = require('../models/Transaction');

class CartController {
  static async checkoutCart(req, res) {
    try {
      const user_id = req.userId;

      // Ambil data user dari database
      const connection = await mysql.createConnection(dbConfig);
      const [user] = await connection.execute(
        'SELECT nama_lengkap, email, no_telepon FROM users WHERE user_id = ?', // Diperbaiki
        [user_id]
      );
      await connection.end();

      if (!user[0]) throw new Error('User tidak ditemukan');

      // Ambil item keranjang
      const items = await Cart.getCartByUserId(user_id);
      if (items.length === 0) {
        return res.status(400).json({ message: 'Keranjang kosong' });
      }

      // Format item_details
      const item_details = items.map((item) => ({
        id: item.product_id.toString(),
        name: item.nama_produk,
        price: item.harga,
        quantity: item.jumlah,
      }));

      // Hitung total
      const gross_amount = items.reduce(
        (sum, item) => sum + item.harga * item.jumlah,
        0
      );

      // Generate order_id
      const order_id = `ORDER-${Date.now()}-${user_id}`;

      // Log data transaksi (SETELAH deklarasi variabel)
      console.log('Transaction Data:', {
        order_id,
        user_id,
        gross_amount,
        item_details: JSON.stringify(item_details),
        payment_status: 'pending',
      });

      // Validasi data
      if (
        !order_id ||
        !user_id ||
        isNaN(gross_amount) ||
        item_details.length === 0
      ) {
        throw new Error('Data transaksi tidak valid');
      }

      // Inisialisasi Snap Midtrans
      const snap = new midtransClient.Snap({
        isProduction: process.env.MIDTRANS_ENV === 'production', // Diperbaiki
        serverKey: process.env.MIDTRANS_SERVER_KEY,
      });

      // Buat payload transaksi
      const transactionPayload = {
        transaction_details: {
          order_id,
          gross_amount,
        },
        item_details,
        customer_details: {
          first_name: user[0].nama_lengkap, // Diperbaiki
          email: user[0].email,
          phone: user[0].no_telepon,
        },
      };

      // Generate token
      const transaction = await snap.createTransaction(transactionPayload);

      // Simpan ke database
      await Transaction.create({
        order_id,
        user_id,
        gross_amount,
        item_details: JSON.stringify(item_details),
        payment_status: 'pending',
      });

      // Update keranjang
      await Cart.updateCheckoutStatus(user_id, transaction.token);

      res.json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      });
    } catch (error) {
      console.error('Checkout error:', error);
      res.status(500).json({ message: error.message });
    }
  }
  static async addToCart(req, res) {
    try {
      const { product_id, jumlah } = req.body;
      const user_id = req.userId;

      if (!product_id || !jumlah || jumlah < 1) {
        return res.status(400).json({ message: 'Input tidak valid' });
      }

      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }

      // Check stock availability
      if (jumlah > product.stok) {
        return res.status(400).json({
          message: `Stok tidak mencukupi. Stok tersisa: ${product.stok}`,
          currentStock: product.stok,
        });
      }

      // Check existing cart item
      const connection = await mysql.createConnection(dbConfig);
      const [existing] = await connection.execute(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND is_checkedout = 0',
        [user_id, product_id]
      );

      if (existing.length > 0) {
        // Update quantity if already exists
        const newQuantity = existing[0].jumlah + jumlah;
        if (newQuantity > product.stok) {
          await connection.end();
          return res.status(400).json({
            message: `Jumlah melebihi stok. Maksimal: ${product.stok}`,
            currentStock: product.stok,
          });
        }

        const [result] = await connection.execute(
          'UPDATE cart SET jumlah = ? WHERE cart_id = ?',
          [newQuantity, existing[0].cart_id]
        );

        await connection.end();
        return res.json({
          message: 'Jumlah produk di keranjang diperbarui',
          cartId: existing[0].cart_id,
        });
      }

      // Add new item to cart
      const [result] = await connection.execute(
        'INSERT INTO cart (user_id, product_id, jumlah) VALUES (?, ?, ?)',
        [user_id, product_id, jumlah]
      );

      await connection.end();
      res.status(201).json({
        message: 'Produk ditambahkan ke keranjang',
        cartId: result.insertId,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getCart(req, res) {
    try {
      const items = await Cart.getCartByUserId(req.userId);
      const formatted = items.map((item) => ({
        ...item,
        price: Number(item.harga),
        image: item.image_url,
      }));
      res.json(formatted);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteFromCart(req, res) {
    try {
      console.log('Delete request received for cart ID:', req.params.cart_id);
      console.log('User ID:', req.userId);

      const result = await Cart.deleteFromCart(req.params.cart_id, req.userId);

      console.log('Delete result:', result);

      if (result.affectedRows === 0) {
        console.warn('Item not found for deletion');
        return res.status(404).json({
          code: 'ITEM_NOT_FOUND',
          message: 'Item tidak ditemukan di keranjang',
        });
      }

      res.json({ message: 'Item berhasil dihapus' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        code: 'SERVER_ERROR',
        message: 'Gagal menghapus item dari keranjang',
      });
    }
  }

  static async updateCartItem(req, res) {
    try {
      console.log('Update request for cart ID:', req.params.cart_id);
      console.log('Request body:', req.body);

      const affectedRows = await Cart.updateQuantity(
        req.params.cart_id,
        req.userId,
        req.body.jumlah
      );

      console.log('Update result:', affectedRows);

      if (affectedRows === 0) {
        console.warn('Item not found for update');
        return res.status(404).json({
          code: 'ITEM_NOT_FOUND',
          message: 'Item tidak ditemukan di keranjang',
        });
      }

      res.json({ message: 'Jumlah berhasil diperbarui' });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({
        code: 'SERVER_ERROR',
        message: 'Gagal memperbarui jumlah item',
      });
    }
  }
}

module.exports = CartController;
