document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = '/admin/login';
    return;
  }

  await loadHeader();
  await loadProducts();
  setupEventListeners();
});

async function loadHeader() {
  try {
    const header = await fetch('/admin/partials/header.html').then((res) =>
      res.text()
    );
    document.getElementById('header-container').innerHTML = header;
    document.getElementById('logoutBtn').addEventListener('click', Auth.logout);
  } catch (error) {
    console.error('Error loading header:', error);
  }
}

async function loadProducts() {
  try {
    const token = Auth.getToken();
    const response = await fetch('/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Gagal memuat produk');

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    showAlert('danger', 'Gagal memuat data produk ${errMessage}');
  }
}

function renderProducts(products) {
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML =
    products.length === 0
      ? `
        <tr>
            <td colspan="5" class="text-center">Tidak ada produk tersedia</td>
        </tr>
    `
      : products
          .map(
            (product) => `
        <tr>
            <td>
                ${
                  product.image_url
                    ? `<img src="${product.image_url}" alt="${product.nama_produk}" class="product-thumbnail">`
                    : '<i class="fas fa-image text-muted"></i>'
                }
            </td>
            <td>${product.nama_produk}</td>
            <td>Rp${product.harga.toLocaleString()}</td>
            <td>${product.stok}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${
                  product.product_id
                }">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                  product.product_id
                }">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
          )
          .join('');

  // Add event listeners
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => showEditForm(btn.dataset.id));
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
  });
}

function setupEventListeners() {
  const modalElement = document.getElementById('productModal');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  // Add Product Button
  document.getElementById('addProductBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Tambah Produk Baru';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    modal.show();
  });

  // Form Submission
  document
    .getElementById('productForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const isEdit = document.getElementById('productId').value !== '';

      try {
        const formData = new FormData();
        formData.append(
          'nama_produk',
          document.getElementById('productName').value
        );
        formData.append(
          'deskripsi',
          document.getElementById('productDescription').value
        );
        formData.append('harga', document.getElementById('productPrice').value);
        formData.append('stok', document.getElementById('productStock').value);

        const imageInput = document.getElementById('productImage');
        if (imageInput.files[0]) {
          formData.append('image', imageInput.files[0]);
        }

        const token = Auth.getToken();
        const url = isEdit
          ? `/api/products/${document.getElementById('productId').value}`
          : '/api/products';

        const response = await fetch(url, {
          method: isEdit ? 'PUT' : 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!response.ok) throw new Error(await response.text());

        await loadProducts();
        modal.hide();
        showAlert(
          'success',
          `Produk berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`
        );
      } catch (error) {
        console.error('Error:', error);
        showAlert(
          'danger',
          `Gagal ${isEdit ? 'memperbarui' : 'menambahkan'} produk`
        );
      }
    });

  // Image Preview
  document
    .getElementById('productImage')
    .addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('imagePreview').innerHTML = `
                    <img src="${event.target.result}" class="img-thumbnail" style="max-height: 150px;">
                `;
        };
        reader.readAsDataURL(file);
      }
    });
}

async function showEditForm(productId) {
  try {
    const token = Auth.getToken();
    const response = await fetch(`/api/products/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Gagal memuat data produk');

    const product = await response.json();

    // Isi form
    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('productId').value = product.product_id;
    document.getElementById('productName').value = product.nama_produk;
    document.getElementById('productDescription').value = product.deskripsi;
    document.getElementById('productPrice').value = product.harga;
    document.getElementById('productStock').value = product.stok;

    // Preview gambar
    document.getElementById('imagePreview').innerHTML = product.image_url
      ? `<img src="${product.image_url}" class="img-thumbnail" style="max-height: 150px;">`
      : '';

    const modal = bootstrap.Modal.getOrCreateInstance(
      document.getElementById('productModal')
    );
    modal.show();
  } catch (error) {
    showAlert('danger', 'Gagal memuat data produk');
  }
}

async function deleteProduct(productId) {
  if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;

  try {
    const token = Auth.getToken();
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Gagal menghapus produk');

    await loadProducts();
    showAlert('success', 'Produk berhasil dihapus');
  } catch (error) {
    showAlert('danger', 'Gagal menghapus produk');
  }
}

function showAlert(type, message) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
  alertDiv.style.zIndex = '1000';
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(alertDiv);

  setTimeout(() => alertDiv.remove(), 5000);
}
