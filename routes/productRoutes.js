const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk menambahkan produk (hanya admin)
router.post('/', authenticateAdmin, ProductController.create);

// Rute untuk melihat semua produk
router.get('/', ProductController.getAll);

// Rute untuk melihat detail produk berdasarkan ID
router.get('/:product_id', ProductController.getById);

// Rute untuk mengedit produk (hanya admin)
router.put('/:product_id', authenticateAdmin, ProductController.update);

// Rute untuk menghapus produk (hanya admin)
router.delete(
  '/:product_id',
  authenticateAdmin,
  ProductController.deleteProduct
);
router.get('/count', authenticateAdmin, async (req, res) => {
  try {
    const count = await Product.countDocuments();
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil jumlah produk' });
  }
});
// Debug endpoint - hanya untuk development
router.get('/debug', authenticateAdmin, async (req, res) => {
  try {
    // Dapatkan semua data produk dengan detail
    const [products] = await db.query('SELECT * FROM products');

    // Dapatkan informasi database
    const [dbInfo] = await db.query(
      'SELECT VERSION() as version, DATABASE() as dbname'
    );

    // Dapatkan informasi tabel
    const [tableInfo] = await db.query(`
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE()
        `);

    res.json({
      status: 'success',
      data: {
        productsCount: products.length,
        sampleProduct: products[0] || null,
        database: dbInfo[0],
        tables: tableInfo,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Debug failed',
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
});

module.exports = router;
