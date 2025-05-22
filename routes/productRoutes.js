const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateAdmin } = require('../middleware/authAdmin');
const { authenticateUser } = require('../middleware/authUser');

const router = express.Router();

router.get('/', ProductController.getAll);
router.get('/:product_id', ProductController.getById);
router.get('/search', ProductController.search);
// CRUD Products
// Admin routes
router.use(authenticateAdmin);
router.post('/', authenticateAdmin, ProductController.create);
router.put('/:product_id', authenticateAdmin, ProductController.update);
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

// GET produk dengan filter
router.get('/', async (req, res) => {
  try {
    const { search, minPrice, maxPrice, sortBy, order } = req.query;

    const products = await ProductController.getFilteredProducts({
      search,
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice),
      sortBy,
      order: order || 'ASC',
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
