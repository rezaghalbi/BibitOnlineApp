const Product = require('../models/Product');
const { IncomingForm } = require('formidable');

const axios = require('axios');
const fs = require('fs');
// Fungsi upload gambar ke Imgur
async function uploadImageToImgur(imagePath) {
  const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });

  const response = await axios.post(
    'https://api.imgur.com/3/image',
    {
      image: imageData,
      type: 'base64',
    },
    {
      headers: {
        Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // Tambahkan di .env
      },
    }
  );

  return response.data.data.link;
}
class ProductController {
  static async create(req, res) {
    const form = new IncomingForm.IncomingForm();
    form.multiples = false;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Error parsing form:', err);
        return res.status(400).json({ message: 'Error parsing the files' });
      }

      // Ambil nilai dari fields
      const nama_produk = fields.nama_produk?.[0];
      const deskripsi = fields.deskripsi?.[0];
      const harga = fields.harga?.[0];
      const stok = fields.stok?.[0];
      const admin_id = req.adminId;

      console.log('🧾 Parsed fields:', {
        nama_produk,
        deskripsi,
        harga,
        stok,
        admin_id,
      });

      // Validasi input
      if (!nama_produk || !deskripsi || !harga || !stok || !admin_id) {
        console.warn('⚠️ Missing required fields');
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Konversi ke tipe angka
      const hargaNumber = parseFloat(harga);
      const stokNumber = parseInt(stok);

      if (isNaN(hargaNumber) || isNaN(stokNumber)) {
        console.warn('⚠️ Harga/Stok bukan angka valid:', { harga, stok });
        return res
          .status(400)
          .json({ message: 'Price and stock must be valid numbers' });
      }

      let imageUrl = null;

      // Proses upload gambar jika ada
      if (files.images) {
        console.log('📁 files:', files);
        const file = files.images;
        // const oldPath = file.filepath;
        const oldPath = files.images[0].filepath; // ✅ BENAR karena ambil elemen pertama dari array

        console.log('🖼️ Uploading image from path:', oldPath);

        try {
          imageUrl = await uploadImageToImgur(oldPath);
          console.log('✅ Image uploaded successfully. URL:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          return res.status(500).json({
            message: 'Error uploading image',
            error: uploadError.message,
          });
        }
      } else {
        console.warn('⚠️ No image file found in request');
      }

      try {
        const productData = {
          nama_produk,
          deskripsi,
          harga: hargaNumber,
          stok: stokNumber,
          admin_id,
          image_url: imageUrl,
        };

        console.log('📦 Creating product with data:', productData);

        const productId = await Product.create(productData);

        res.status(201).json({
          message: 'Product created successfully',
          productId,
        });
      } catch (error) {
        console.error('❌ Error creating product:', error);
        res.status(500).json({
          message: 'Error creating product',
          error: error.message,
        });
      }
    });
  }

  static async getAll(req, res) {
    try {
      const products = await Product.findAll();
      res.status(200).json(products);
    } catch (error) {
      console.error('Error fetching products:', error); // Debugging
      res
        .status(500)
        .json({ message: 'Error fetching products', error: error.message });
    }
  }

  static async getById(req, res) {
    const { product_id } = req.params;

    try {
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error); // Debugging
      res
        .status(500)
        .json({ message: 'Error fetching product', error: error.message });
    }
  }

  static async update(req, res) {
    const { product_id } = req.params;

    const form = new IncomingForm({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Error parsing form:', err);
        return res.status(400).json({ message: 'Error parsing the files' });
      }

      console.log('✅ Parsed fields:', fields);
      console.log('📁 files:', files);

      const { nama_produk, deskripsi, harga, stok } = fields;

      if (!nama_produk || !deskripsi || !harga || !stok) {
        return res.status(400).json({ message: 'Semua field wajib diisi' });
      }

      const hargaNumber = parseFloat(harga);
      const stokNumber = parseInt(stok);

      if (isNaN(hargaNumber) || isNaN(stokNumber)) {
        return res
          .status(400)
          .json({ message: 'Harga dan stok harus angka valid' });
      }

      let imageUrl = null;

      if (files.images) {
        const file = Array.isArray(files.images)
          ? files.images[0]
          : files.images;
        const oldPath = file.filepath;

        if (!oldPath) {
          return res.status(400).json({ message: 'Image filepath not found' });
        }

        console.log('🖼️ Uploading image from path:', oldPath);

        try {
          imageUrl = await uploadImageToImgur(oldPath);
          console.log('✅ Image uploaded successfully:', imageUrl);
        } catch (uploadError) {
          console.error('❌ Error uploading image:', uploadError);
          return res.status(500).json({
            message: 'Error uploading image',
            error: uploadError.message,
          });
        }
      }

      try {
        const product = await Product.findById(product_id);
        if (!product) {
          return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // Data yang akan diupdate
        const updatedData = {
          nama_produk: nama_produk[0], // ambil nilai pertama
          deskripsi: deskripsi[0],
          harga: parseInt(harga[0]),
          stok: parseInt(stok[0]),
          image_url: imageUrl, // dari hasil upload imgur
        };

        // Panggil method update di model
        await Product.update(product_id, updatedData);

        res.status(200).json({
          message: 'Produk berhasil diperbarui',
          product: { product_id, ...updatedData },
        });
      } catch (error) {
        console.error('❌ Error updating product:', error);
        res.status(500).json({
          message: 'Error updating product',
          error: error.message,
        });
      }
    });
  }
  static async deleteProduct(req, res) {
    try {
      const { product_id } = req.params;

      if (!product_id) {
        return res.status(400).json({ message: 'Product ID is required' });
      }

      const result = await Product.delete(product_id);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      res.status(500).json({
        message: 'Failed to delete product',
        error: error.message,
      });
    }
  }
}

module.exports = ProductController;
