const Product = require('../models/Product');

class ProductController {
  // Metode untuk menambahkan produk
  static async create(req, res) {
    const { nama_produk, deskripsi, harga, stok } = req.body;
    const admin_id = req.adminId; // Ambil adminId dari token JWT

    // Validasi input
    if (!nama_produk || !harga || !stok) {
      return res
        .status(400)
        .json({ message: 'Product name, price, and stock are required' });
    }

    try {
      const productId = await Product.create({
        nama_produk,
        deskripsi,
        harga,
        stok,
        admin_id,
      });

      res
        .status(201)
        .json({ message: 'Product created successfully', productId });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({
        message: 'Error creating product',
        error: error.message || error,
      });
    }
  }

  // Metode untuk melihat semua produk
  static async getAll(req, res) {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({
        message: 'Error fetching products',
        error: error.message || error,
      });
    }
  }

  // Metode untuk melihat detail produk berdasarkan ID
  static async getById(req, res) {
    const { product_id } = req.params;

    try {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({
        message: 'Error fetching product',
        error: error.message || error,
      });
    }
  }

  // Metode untuk mengedit produk
  static async update(req, res) {
    const { product_id } = req.params;
    const { nama_produk, deskripsi, harga, stok } = req.body;

    // Validasi input
    if (!nama_produk || !harga || !stok) {
      return res
        .status(400)
        .json({ message: 'Product name, price, and stock are required' });
    }

    try {
      const result = await Product.update(product_id, {
        nama_produk,
        deskripsi,
        harga,
        stok,
      });

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
      console.error('Error updating product:', error);
      res.status(500).json({
        message: 'Error updating product',
        error: error.message || error,
      });
    }
  }

  // Metode untuk menghapus produk
  static async delete(req, res) {
    const { product_id } = req.params;

    try {
      const result = await Product.deleteById(product_id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        message: 'Error deleting product',
        error: error.message || error,
      });
    }
  }
}

module.exports = ProductController;
