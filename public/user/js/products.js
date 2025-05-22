document.addEventListener('DOMContentLoaded', async () => {
  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) window.location.href = '/login';
    return token;
  };

  // Format harga ke Rupiah
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(number);
  };

  // Load produk
  const loadProducts = async () => {
    try {
      const token = checkAuth();
      const response = await fetch('/api/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memuat produk');
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  };

  // Render produk
  const renderProducts = (products) => {
    const container = document.getElementById('productsContainer');
    container.innerHTML = products
      .map(
        (product) => `
            <div class="col">
                <div class="card product-card h-100" data-id="${
                  product.product_id
                }">
                    <div class="product-image-container">
                        ${
                          product.image_url
                            ? `<img src="${product.image_url}" class="product-image" alt="${product.nama_produk}">`
                            : `<div class="placeholder-image">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image" viewBox="0 0 16 16">
                                    <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                                    <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                                </svg>
                            </div>`
                        }
                    </div>
                    <div class="card-body">
                        <h5 class="product-title">${product.nama_produk}</h5>
                        <p class="price-tag mb-0">${formatRupiah(
                          product.harga
                        )}</p>
                    </div>
                </div>
            </div>
        `
      )
      .join('');

    // Click handler untuk detail produk
    document.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('click', () => {
        const productId = card.dataset.id;
        window.location.href = `/product-detail.html?id=${productId}`;
      });
    });
  };

  // Fungsi filter dan sort
  const applyFilters = (products) => {
    const searchTerm = document
      .getElementById('searchInput')
      .value.toLowerCase();
    const sortValue = document.getElementById('sortSelect').value;

    let filtered = products.filter((p) => {
      return (
        p.nama_produk.toLowerCase().includes(searchTerm) ||
        p.deskripsi.toLowerCase().includes(searchTerm)
      );
    });

    // Sorting
    switch (sortValue) {
      case 'name_asc':
        filtered.sort((a, b) => a.nama_produk.localeCompare(b.nama_produk));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.nama_produk.localeCompare(a.nama_produk));
        break;
      case 'price_asc':
        filtered.sort((a, b) => a.harga - b.harga);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.harga - a.harga);
        break;
    }

    renderProducts(filtered);
  };

  // Inisialisasi
  try {
    const products = await loadProducts();
    renderProducts(products);

    // Event listeners untuk filter
    document
      .getElementById('searchInput')
      .addEventListener('input', () => applyFilters(products));
    document
      .getElementById('sortSelect')
      .addEventListener('change', () => applyFilters(products));
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
