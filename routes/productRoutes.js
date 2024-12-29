const express = require('express');
const ProductController = require('../controllers/ProductController');
const { authenticateAdmin } = require('../middleware/authAdmin');

const router = express.Router();

// Rute untuk menambahkan produk
router.post('/', authenticateAdmin, ProductController.create);

// Rute untuk melihat semua produk
router.get('/', authenticateAdmin, ProductController.getAll);

// Rute untuk melihat detail produk berdasarkan ID
router.get('/:product_id', authenticateAdmin, ProductController.getById);

// Rute untuk mengedit produk
router.put('/:product_id', authenticateAdmin, ProductController.update);

// Rute untuk menghapus produk
router.delete('/:product_id', authenticateAdmin, ProductController.delete);

module.exports = router;
