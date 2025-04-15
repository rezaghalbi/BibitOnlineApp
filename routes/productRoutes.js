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
router.delete('/:product_id', authenticateAdmin, ProductController.delete);

module.exports = router;
