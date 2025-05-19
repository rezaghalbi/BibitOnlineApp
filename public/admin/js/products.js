/**
 * Product Management Script
 * Terhubung dengan backend untuk operasi CRUD produk
 * Dilengkapi dengan logging dan error handling
 */

document.addEventListener('DOMContentLoaded', async function () {
  console.log('[DEBUG] Document loaded, initializing product management...');

  try {
    // ======================
    // 1. INITIAL SETUP
    // ======================
    console.log('[DEBUG] Loading partials and checking auth...');

    // Load partials
    await loadPartials();

    // Check authentication
    if (!Auth.isAuthenticated()) {
      console.warn('[WARNING] User not authenticated, redirecting to login');
      window.location.href = '/admin/login';
      return;
    }

    // ======================
    // 2. ELEMENT REFERENCES
    // ======================
    console.log('[DEBUG] Initializing UI elements...');

    const elements = {
      modal: new bootstrap.Modal(document.getElementById('productModal')),
      form: document.getElementById('productForm'),
      table: document.getElementById('productsTable'),
      search: document.getElementById('productSearch'),
      addBtn: document.getElementById('addProductBtn'),
      saveBtn: document.getElementById('saveProductBtn'),
      imagePreview: document.getElementById('imagePreviewContainer'),
      imageInput: document.getElementById('productImage'),
      saveBtnText: document.getElementById('saveBtnText'),
      saveBtnSpinner: document.getElementById('saveBtnSpinner'),
      toast: new bootstrap.Toast(document.getElementById('notificationToast')),
      productId: document.getElementById('productId'),
      productName: document.getElementById('productName'),
      productPrice: document.getElementById('productPrice'),
      productStock: document.getElementById('productStock'),
      productDesc: document.getElementById('productDescription'),
    };

    // ======================
    // 3. STATE VARIABLES
    // ======================
    let currentProducts = [];
    let currentPage = 1;
    const itemsPerPage = 10;

    // ======================
    // 4. EVENT LISTENERS
    // ======================
    console.log('[DEBUG] Setting up event listeners...');

    elements.addBtn.addEventListener('click', () => openProductModal());
    elements.search.addEventListener('input', debounce(searchProducts, 300));
    elements.saveBtn.addEventListener('click', handleSaveProduct);
    elements.imageInput.addEventListener('change', handleImageUpload);

    // ======================
    // 5. INITIAL DATA LOAD
    // ======================
    console.log('[DEBUG] Loading initial products...');
    await loadProducts();

    // ======================
    // CORE FUNCTIONS
    // ======================

    /**
     * Load products from API
     */
    async function loadProducts() {
      console.log('[DEBUG] Loading products...');
      showLoading(true);

      try {
        const token = Auth.getToken();
        if (!token) throw new Error('No authentication token found');

        const searchQuery = elements.search.value.trim();
        console.log(`[DEBUG] Fetching products with search: "${searchQuery}"`);

        const response = await fetch(`/api/products?search=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('[DEBUG] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            '[ERROR] Server response:',
            errorData || (await response.text())
          );
          throw new Error(
            errorData?.message || `Server returned ${response.status}`
          );
        }

        currentProducts = await response.json();
        console.log(`[DEBUG] Received ${currentProducts.length} products`);

        if (currentProducts.length === 0) {
          console.warn('[WARNING] No products found');
          showNotification('info', 'Info', 'Tidak ada produk ditemukan');
        }

        renderProducts();
      } catch (error) {
        console.error('[ERROR] Failed to load products:', error);
        showNotification('error', 'Error', 'Gagal memuat produk');
        renderErrorState(error);
      } finally {
        showLoading(false);
      }
    }

    /**
     * Render products to table
     */
    function renderProducts() {
      console.log('[DEBUG] Rendering products table...');
      elements.table.innerHTML = '';

      if (currentProducts.length === 0) {
        elements.table.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-5 text-muted">
                            <i class="fas fa-box-open fa-2x mb-3"></i>
                            <p class="mb-0">Tidak ada produk ditemukan</p>
                        </td>
                    </tr>
                `;
        return;
      }

      currentProducts.forEach((product) => {
        const tr = document.createElement('tr');
        tr.className = 'animate__animated animate__fadeIn';
        tr.innerHTML = `
                    <td>${product.product_id}</td>
                    <td>
                        ${
                          product.image_url
                            ? `<img src="${product.image_url}" alt="${product.nama_produk}" class="product-thumbnail" 
                                 onerror="this.onerror=null;this.src='https://via.placeholder.com/50?text=Gagal+Memuat'">`
                            : '<i class="fas fa-box-open text-muted"></i>'
                        }
                    </td>
                    <td>${product.nama_produk}</td>
                    <td>Rp${Number(product.harga).toLocaleString('id-ID')}</td>
                    <td>${product.stok}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-primary edit-product me-1" 
                                data-id="${product.product_id}" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-product" 
                                data-id="${product.product_id}" title="Hapus">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

        elements.table.appendChild(tr);
      });

      // Attach event listeners to action buttons
      document.querySelectorAll('.edit-product').forEach((btn) => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
      });

      document.querySelectorAll('.delete-product').forEach((btn) => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
      });
    }

    /**
     * Open product modal (add/edit)
     */
    function openProductModal(product = null) {
      console.log('[DEBUG] Opening modal in', product ? 'edit' : 'add', 'mode');

      // Reset form
      elements.form.reset();
      elements.form.classList.remove('was-validated');
      elements.imagePreview.innerHTML = `
                <i class="fas fa-image fa-4x text-muted mb-2"></i>
                <p class="mb-0 text-muted">Preview gambar akan muncul di sini</p>
            `;
      elements.imageInput.value = '';

      if (product) {
        // Edit mode
        elements.modal._element.querySelector('.modal-title').textContent =
          'Edit Produk';
        elements.productId.value = product.product_id;
        elements.productName.value = product.nama_produk;
        elements.productPrice.value = product.harga;
        elements.productStock.value = product.stok;
        elements.productDesc.value = product.deskripsi || '';

        if (product.image_url) {
          elements.imagePreview.innerHTML = `
                        <img src="${product.image_url}" alt="${product.nama_produk}" 
                             class="img-fluid rounded" style="max-height: 200px;"
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Gagal+Memuat+Gambar'">
                        <small class="text-muted d-block mt-1">Gambar saat ini</small>
                    `;
        }
      } else {
        // Add mode
        elements.modal._element.querySelector('.modal-title').textContent =
          'Tambah Produk Baru';
        elements.productId.value = '';
      }

      elements.modal.show();
    }

    /**
     * Handle image upload preview
     */
    function handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      console.log('[DEBUG] Selected file:', file.name, file.type, file.size);

      // Validate file
      if (!file.type.match('image.*')) {
        console.warn('[WARNING] Invalid file type');
        showNotification('error', 'Error', 'Harap pilih file gambar (JPG/PNG)');
        event.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        console.warn('[WARNING] File too large');
        showNotification('error', 'Error', 'Ukuran gambar maksimal 5MB');
        event.target.value = '';
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        elements.imagePreview.innerHTML = `
                    <img src="${e.target.result}" class="img-fluid rounded" style="max-height: 200px;">
                    <small class="text-muted d-block mt-1">Preview gambar baru</small>
                `;
      };
      reader.onerror = () => {
        console.error('[ERROR] Failed to read file');
        showNotification('error', 'Error', 'Gagal membaca file gambar');
      };
      reader.readAsDataURL(file);
    }

    /**
     * Handle save product (create/update)
     */
    async function handleSaveProduct() {
      console.log('[DEBUG] Handling product save...');

      // Validate form
      if (!elements.form.checkValidity()) {
        console.warn('[WARNING] Form validation failed');
        elements.form.classList.add('was-validated');
        return;
      }

      try {
        const token = Auth.getToken();
        if (!token) throw new Error('No authentication token found');

        const formData = new FormData();
        const productId = elements.productId.value;
        const isEditMode = !!productId;

        // Prepare form data
        formData.append('nama_produk', elements.productName.value);
        formData.append('harga', elements.productPrice.value);
        formData.append('stok', elements.productStock.value);
        formData.append('deskripsi', elements.productDesc.value);

        if (elements.imageInput.files[0]) {
          formData.append('image', elements.imageInput.files[0]);
        }

        // Show loading state
        elements.saveBtnText.textContent = 'Menyimpan...';
        elements.saveBtnSpinner.classList.remove('d-none');
        elements.saveBtn.disabled = true;

        // API request
        const endpoint = isEditMode
          ? `/api/products/${productId}`
          : '/api/products';

        const method = isEditMode ? 'PUT' : 'POST';

        console.log(`[DEBUG] Sending ${method} request to ${endpoint}`);
        const response = await fetch(endpoint, {
          method,
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        console.log('[DEBUG] Save response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            '[ERROR] Save failed:',
            errorData || (await response.text())
          );
          throw new Error(
            errorData?.message || `Server returned ${response.status}`
          );
        }

        const result = await response.json();
        console.log('[DEBUG] Save successful:', result);

        // Close modal and refresh
        elements.modal.hide();
        await loadProducts();
        showNotification(
          'success',
          'Sukses',
          isEditMode
            ? 'Produk berhasil diperbarui'
            : 'Produk berhasil ditambahkan'
        );
      } catch (error) {
        console.error('[ERROR] Save product failed:', error);
        showNotification(
          'error',
          'Error',
          error.message || 'Gagal menyimpan produk'
        );
      } finally {
        // Reset button state
        elements.saveBtnText.textContent = 'Simpan';
        elements.saveBtnSpinner.classList.add('d-none');
        elements.saveBtn.disabled = false;
      }
    }

    /**
     * Edit product
     */
    async function editProduct(productId) {
      console.log(`[DEBUG] Editing product ID: ${productId}`);
      showLoading(true);

      try {
        const token = Auth.getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('[DEBUG] Edit response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            '[ERROR] Fetch failed:',
            errorData || (await response.text())
          );
          throw new Error(
            errorData?.message || `Server returned ${response.status}`
          );
        }

        const product = await response.json();
        console.log('[DEBUG] Product data:', product);
        openProductModal(product);
      } catch (error) {
        console.error('[ERROR] Edit product failed:', error);
        showNotification(
          'error',
          'Error',
          error.message || 'Gagal memuat detail produk'
        );
      } finally {
        showLoading(false);
      }
    }

    /**
     * Delete product
     */
    async function deleteProduct(productId) {
      console.log(`[DEBUG] Deleting product ID: ${productId}`);

      if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
        console.log('[DEBUG] Delete cancelled by user');
        return;
      }

      showLoading(true);

      try {
        const token = Auth.getToken();
        if (!token) throw new Error('No authentication token found');

        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log('[DEBUG] Delete response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error(
            '[ERROR] Delete failed:',
            errorData || (await response.text())
          );
          throw new Error(
            errorData?.message || `Server returned ${response.status}`
          );
        }

        console.log('[DEBUG] Product deleted successfully');
        await loadProducts();
        showNotification('success', 'Sukses', 'Produk berhasil dihapus');
      } catch (error) {
        console.error('[ERROR] Delete product failed:', error);
        showNotification(
          'error',
          'Error',
          error.message || 'Gagal menghapus produk'
        );
      } finally {
        showLoading(false);
      }
    }

    // ======================
    // HELPER FUNCTIONS
    // ======================

    async function loadPartials() {
      try {
        const partials = ['header', 'sidebar', 'footer'];
        for (const partial of partials) {
          const response = await fetch(`partials/${partial}.html`);
          if (!response.ok) throw new Error(`Failed to load ${partial}`);
          document.getElementById(`${partial}-container`).innerHTML =
            await response.text();
        }

        // Setup logout and sidebar toggle
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
          Auth.removeToken();
          window.location.href = '/admin/login';
        });

        document
          .getElementById('sidebarToggle')
          ?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
            document.querySelector('.main-content').classList.toggle('active');
          });
      } catch (error) {
        console.error('[ERROR] Failed to load partials:', error);
        showNotification('error', 'Error', 'Gagal memuat komponen halaman');
      }
    }

    function showLoading(show) {
      if (show) {
        elements.table.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                            <p class="mt-2 text-muted">Memuat data produk...</p>
                        </td>
                    </tr>
                `;
      }
    }

    function renderErrorState(error) {
      elements.table.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5 text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p class="mb-0">Gagal memuat data produk</p>
                        <small class="text-muted">${error.message}</small>
                        <button class="btn btn-sm btn-outline-primary mt-3" onclick="window.location.reload()">
                            <i class="fas fa-sync-alt me-1"></i> Coba Lagi
                        </button>
                    </td>
                </tr>
            `;
    }

    function showNotification(type, title, message) {
      const toastElement = document.getElementById('notificationToast');
      const toastTitle = document.getElementById('toastTitle');
      const toastMessage = document.getElementById('toastMessage');

      // Set notification type
      toastElement.classList.remove(
        'text-bg-success',
        'text-bg-danger',
        'text-bg-warning'
      );
      toastElement.classList.add(
        `text-bg-${
          type === 'error'
            ? 'danger'
            : type === 'warning'
            ? 'warning'
            : 'success'
        }`
      );

      toastTitle.textContent = title;
      toastMessage.textContent = message;
      elements.toast.show();
    }

    function searchProducts() {
      console.log('[DEBUG] Searching products...');
      currentPage = 1;
      loadProducts();
    }

    function debounce(func, timeout = 300) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }
  } catch (error) {
    console.error('[CRITICAL ERROR] Initialization failed:', error);
    document.body.innerHTML = `
            <div class="container mt-5">
                <div class="alert alert-danger">
                    <h4 class="alert-heading">Terjadi Kesalahan Kritis</h4>
                    <p>Gagal memuat halaman manajemen produk. Silakan refresh halaman atau hubungi administrator.</p>
                    <hr>
                    <p class="mb-0">${error.message}</p>
                    <button class="btn btn-primary mt-3" onclick="window.location.reload()">
                        <i class="fas fa-sync-alt me-1"></i> Refresh Halaman
                    </button>
                </div>
            </div>
        `;
  }
});

// Global error handler (for uncaught errors)
window.addEventListener('error', (event) => {
  console.error('[UNCAUGHT ERROR]', event.error);
  alert(`Terjadi kesalahan: ${event.message}`);
});
