document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  let product = null;
  let maxStock = 0;

  const showNotification = async (message, type = 'info') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    return Toast.fire({
      icon: type,
      title: message,
    });
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) window.location.href = '/login';
    return token;
  };

  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Load product details
  const loadProduct = async () => {
    try {
      const token = checkAuth();
      const response = await fetch(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Produk tidak ditemukan');

      product = await response.json();
      maxStock = product.stok;

      // Update UI
      document.getElementById('productName').textContent = product.nama_produk;
      document.getElementById('productDescription').textContent =
        product.deskripsi;
      document.getElementById('productPrice').textContent = formatRupiah(
        product.harga
      );
      document.getElementById(
        'stockInfo'
      ).textContent = `Stok tersedia: ${maxStock}`;

      const productImage = document.getElementById('productImage');
      productImage.src = product.image_url || '/images/placeholder.png';

      // Quantity controls
      const quantityInput = document.getElementById('quantity');
      quantityInput.max = maxStock;

      document.getElementById('decrement').addEventListener('click', () => {
        if (quantityInput.value > 1) quantityInput.value--;
      });

      document.getElementById('increment').addEventListener('click', () => {
        if (quantityInput.value < maxStock) quantityInput.value++;
      });

      quantityInput.addEventListener('change', () => {
        if (quantityInput.value > maxStock) {
          quantityInput.value = maxStock;
          showNotification(`Stok tersedia hanya ${maxStock}`, 'warning');
        }
      });
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message, 'error');
      setTimeout(() => (window.location.href = '/products'), 1500);
    }
  };

  // Add to cart handler
  document
    .getElementById('addToCartBtn')
    .addEventListener('click', async () => {
      const btn = document.getElementById('addToCartBtn');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menambahkan...';

      try {
        const token = checkAuth();
        const quantity = parseInt(document.getElementById('quantity').value);

        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            product_id: productId,
            jumlah: quantity,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          await showNotification(
            data.message || 'Produk berhasil ditambahkan ke keranjang',
            'success'
          );
          setTimeout(() => 100);
        } else {
          throw new Error(
            data.message || 'Gagal menambahkan produk ke keranjang'
          );
        }
      } catch (error) {
        console.error('Error:', error);
        await showNotification(error.message, 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML =
          '<i class="fas fa-cart-plus me-2"></i>Tambah ke Keranjang';
      }
    });

  // Initial load
  await loadProduct();
});
