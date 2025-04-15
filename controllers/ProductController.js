const Product = require('../models/Product');
const formidable = require('formidable');
const axios = require('axios');
const fs = require('fs');

class ProductController {
  static async create(req, res) {
    const form = new formidable.IncomingForm();
    form.multiples = false; 

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err); // Debugging
        return res.status(400).json({ message: 'Error parsing the files' });
      }

      // Ambil nilai dari fields
      const nama_produk = fields.nama_produk[0]; 
      const deskripsi = fields.deskripsi[0]; 
      const harga = fields.harga; 
      const stok = fields.stok; 
      const admin_id = req.adminId; 

      // Validasi input
      if (!nama_produk || !deskripsi || !harga || !stok) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Konversi harga dan stok ke tipe data yang benar
      const hargaNumber = parseFloat(harga);
      const stokNumber = parseInt(stok);

      if (isNaN(hargaNumber) || isNaN(stokNumber)) {
        return res
          .status(400)
          .json({ message: 'Price and stock must be valid numbers' });
      }

      let imageUrl = null; 

      // Simpan gambar 
      if (files.images) {
        const file = files.images; 
        const oldPath = file.filepath; 

        // Upload ke Imgur
        try {
          imageUrl = await uploadImageToImgur(oldPath); // Fungsi untuk mengupload gambar
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError); 
          return res.status(500).json({
            message: 'Error uploading image',
            error: uploadError.message,
          });
        }
      }

      try {
        console.log('Creating product with data:', {
          nama_produk,
          deskripsi,
          harga: hargaNumber,
          stok: stokNumber,
          admin_id,
          imageUrl,
        }); // Debugging

        const productId = await Product.create({
          nama_produk,
          deskripsi,
          harga: hargaNumber, // Pastikan harga adalah angka
          stok: stokNumber, // Pastikan stok adalah angka
          admin_id,
          image_url: imageUrl, // Simpan URL gambar
        });

        res
          .status(201)
          .json({ message: 'Product created successfully', productId });
      } catch (error) {
        console.error('Error creating product:', error); // Debugging
        res
          .status(500)
          .json({ message: 'Error creating product', error: error.message });
      }
    });
  }

  // Fungsi untuk mengupload gambar ke Imgur
  static async uploadImageToImgur(imagePath) {
    const clientId = '8e289d5a7ad458c'; // Ganti dengan Client ID Anda
    const image = fs.readFileSync(imagePath).toString('base64');

    try {
      const response = await axios.post(
        'https://api.imgur.com/3/image',
        {
          image: image,
        },
        {
          headers: {
            Authorization: `Client-ID ${clientId}`,
          },
        }
      );

      return response.data.data.link; // Mengembalikan URL gambar
    } catch (error) {
      console.error('Error uploading image to Imgur:', error);
      throw error;
    }
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
    const form = new formidable.IncomingForm();
    form.multiples = false; // Hanya izinkan satu file

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err); // Debugging
        return res.status(400).json({ message: 'Error parsing the files' });
      }

      const { product_id } = req.params;
      const nama_produk = fields.nama_produk[0]; // Ambil nilai pertama dari array
      const deskripsi = fields.deskripsi[0]; // Ambil nilai pertama dari array
      const harga = fields.harga; // Ini seharusnya sudah menjadi string
      const stok = fields.stok; // Ini seharusnya sudah menjadi string

      // Validasi input
      if (!nama_produk || !deskripsi || !harga || !stok) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Konversi harga dan stok ke tipe data yang benar
      const hargaNumber = parseFloat(harga);
      const stokNumber = parseInt(stok);

      if (isNaN(hargaNumber) || isNaN(stokNumber)) {
        return res
          .status(400)
          .json({ message: 'Price and stock must be valid numbers' });
      }

      let imageUrl = null; // Inisialisasi URL gambar

      // Simpan gambar jika ada
      if (files.images) {
        const file = files.images; // Ambil file gambar
        const oldPath = file.filepath; // Path sementara file

        // Upload ke Imgur
        try {
          imageUrl = await uploadImageToImgur(oldPath); // Fungsi untuk mengupload gambar
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError); // D
          return res.status(500).json({
            message: 'Error uploading image',
            error: uploadError.message,
          });
        }
      }

      try {
        console.log('Updating product with ID:', product_id, 'and data:', {
          nama_produk,
          deskripsi,
          harga: hargaNumber,
          stok: stokNumber,
          imageUrl,
        }); // Debugging

        const result = await Product.update(product_id, {
          nama_produk,
          deskripsi,
          harga: hargaNumber, // Pastikan harga adalah angka
          stok: stokNumber, // Pastikan stok adalah angka
          image_url: imageUrl, // Simpan URL gambar
        });

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully' });
      } catch (error) {
        console.error('Error updating product:', error); // Debugging
        res
          .status(500)
          .json({ message: 'Error updating product', error: error.message });
      }
    });
  }

  static async delete(req, res) {
    const { product_id } = req.params;

    try {
      const result = await Product.deleteById(product_id);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error); // Debugging
      res
        .status(500)
        .json({ message: 'Error deleting product', error: error.message });
    }
  }
}

module.exports = ProductController;
