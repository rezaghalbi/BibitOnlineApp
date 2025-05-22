document.addEventListener('DOMContentLoaded', async () => {
  let currentCartItem = null;
  const editModal = new bootstrap.Modal('#editModal');
  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) window.location.href = '/login';
    return token;
  };
  const showNotification = (message, type = 'info') => {
    const background = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107',
    }[type];

    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: 'top',
      position: 'right',
      style: { background },
    }).showToast();
  };
  // Format Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Load cart items
  const loadCart = async () => {
    try {
      const token = checkAuth();
      const response = await fetch('/api/cart', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memuat keranjang');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // Render cart items
  const renderCart = (items) => {
    const container = document.getElementById('cartItems');
    let total = 0;

    if (items.length === 0) {
      container.innerHTML = `
                <div class="empty-cart card">
                    <div class="card-body">
                        <i class="fas fa-shopping-cart"></i>
                        <h4>Keranjang belanja kosong</h4>
                        <p>Mulai belanja sekarang!</p>
                    </div>
                </div>
            `;
      document.getElementById('totalPrice').textContent = formatRupiah(0);
      return;
    }

    container.innerHTML = items
      .map((item) => {
        total += item.harga * item.jumlah;
        return `
                <div class="cart-item" data-cart-id="${item.cart_id}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${
                              item.image_url || '/images/placeholder.png'
                            }" 
                                 class="item-image" 
                                 alt="${item.nama_produk}">
                        </div>
                        <div class="col-md-4">
                            <h5 class="mb-1">${item.nama_produk}</h5>
                            <p class="text-muted mb-0">${formatRupiah(
                              item.harga
                            )}/item</p>
                        </div>
                        <div class="col-md-3">
                            <div class="d-flex align-items-center gap-2">
                                <button class="btn btn-outline-secondary btn-action" 
                                        data-action="decrement">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="quantity">${item.jumlah}</span>
                                <button class="btn btn-outline-secondary btn-action" 
                                        data-action="increment">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="col-md-2 text-end">
                            <h5 class="mb-0">${formatRupiah(
                              item.harga * item.jumlah
                            )}</h5>
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-danger btn-action delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
      })
      .join('');

    document.getElementById('totalPrice').textContent = formatRupiah(total);

    // Add event listeners
    document.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', handleQuantityChange);
    });

    document.querySelectorAll('.delete-btn').forEach((btn) => {
      btn.addEventListener('click', handleDeleteItem);
    });
  };

  // Handle quantity change
  const handleQuantityChange = async (e) => {
    const action = e.target.closest('button').dataset.action;
    const cartItem = e.target.closest('.cart-item');
    const cartId = cartItem.dataset.cartId;
    const quantityElement = cartItem.querySelector('.quantity');
    let quantity = parseInt(quantityElement.textContent);

    try {
      const token = checkAuth();

      if (action === 'increment') quantity++;
      if (action === 'decrement' && quantity > 1) quantity--;

      const response = await fetch(`/api/cart/${cartId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jumlah: quantity }),
      });

      if (!response.ok) throw new Error('Gagal mengupdate jumlah');

      quantityElement.textContent = quantity;
      updateTotalPrice();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  // Handle delete item
  // Modifikasi error handling
  const handleDeleteItem = async (e) => {
    const cartItem = e.target.closest('.cart-item');
    const cartId = cartItem.dataset.cartId;

    const confirmResult = await Swal.fire({
      title: 'Hapus Item?',
      text: 'Anda tidak bisa mengembalikan item yang sudah dihapus!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = checkAuth();
      const response = await fetch(`/api/cart/${cartId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.message || 'Gagal menghapus item', 'error');
        throw new Error(data.message);
      }

      cartItem.remove();
      updateTotalPrice();
      showNotification('Item berhasil dihapus', 'success');
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Terjadi kesalahan', 'error');
    }
  };

  // Handle Checkout
  document.getElementById('checkoutBtn').addEventListener('click', async () => {
    const btn = this;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        // Embed Midtrans Snap
        window.snap.embed(data.token, {
          embedId: 'snap-container',
          onSuccess: async function (result) {
            await Swal.fire({
              icon: 'success',
              title: 'Pembayaran Berhasil!',
              text: 'Terima kasih telah berbelanja',
            });
            window.location.href = `/order/${data.order_id}`;
          },
          onPending: function (result) {
            Swal.fire({
              icon: 'info',
              title: 'Menunggu Pembayaran',
              text: 'Silakan selesaikan pembayaran Anda',
            });
          },
          onError: function (result) {
            Swal.fire({
              icon: 'error',
              title: 'Pembayaran Gagal',
              text: 'Silakan coba lagi atau pilih metode pembayaran lain',
            });
          },
        });

        // Tampilkan modal pembayaran
        const paymentModal = new bootstrap.Modal('#paymentModal');
        paymentModal.show();
      } else {
        throw new Error(data.message || 'Checkout gagal');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    } finally {
      btn.disabled = false;
      btn.innerHTML =
        '<i class="fas fa-credit-card me-2"></i>Checkout Sekarang';
    }
  });

  // Update total price
  const updateTotalPrice = () => {
    let total = 0;
    document.querySelectorAll('.cart-item').forEach((item) => {
      const price = parseInt(
        item.querySelector('.text-muted').textContent.replace(/\D/g, '')
      );
      const quantity = parseInt(item.querySelector('.quantity').textContent);
      total += price * quantity;
    });
    document.getElementById('totalPrice').textContent = formatRupiah(total);
  };

  // Initial load
  try {
    const items = await loadCart();
    renderCart(items);
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
