const Cart = require('../models/Cart');

class CartController {
  // Metode untuk menambahkan produk ke keranjang
  static async addToCart(req, res) {
    const { product_id, jumlah } = req.body;
    const user_id = req.userId; // Ambil userId dari token JWT

    // Validasi input
    if (typeof product_id === 'undefined' || typeof jumlah === 'undefined') {
      return res
        .status(400)
        .json({ message: 'Product ID and quantity are required' });
    }

    try {
      const cartId = await Cart.addToCart({
        user_id,
        product_id,
        jumlah,
      });

      res
        .status(201)
        .json({ message: 'Product added to cart successfully', cartId });
    } catch (error) {
      console.error('Error adding to cart:', error);
      res.status(500).json({
        message: 'Error adding to cart',
        error: error.message || error,
      });
    }
  }

  // Metode untuk melihat keranjang berdasarkan user_id
  static async getCart(req, res) {
    const user_id = req.userId; // Ambil userId dari token JWT

    try {
      const cartItems = await Cart.getCartByUserId(user_id);
      // Hitung total harga
      const total_harga = cartItems.reduce(
        (total, item) => total + item.harga * item.jumlah,
        0
      );
      res.status(200).json({ cartItems, total_harga });
    } catch (error) {
      console.error('Error fetching cart:', error);
      res.status(500).json({
        message: 'Error fetching cart',
        error: error.message || error,
      });
    }
  }

  // Metode untuk menghapus produk dari keranjang
  static async deleteFromCart(req, res) {
    const { cart_id } = req.params;

    try {
      const result = await Cart.deleteFromCart(cart_id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Cart item not found' });
      }
      res.status(200).json({ message: 'Cart item deleted successfully' });
    } catch (error) {
      console.error('Error deleting cart item:', error);
      res.status(500).json({
        message: 'Error deleting cart item',
        error: error.message || error,
      });
    }
  }
}

module.exports = CartController;
