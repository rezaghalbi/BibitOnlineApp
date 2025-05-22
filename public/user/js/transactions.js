// public/user/js/transactions.js
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadTransactions();
  initEventListeners();
  initModal();
});

// Fungsi dasar autentikasi
const checkAuth = () => {
  const token = localStorage.getItem('jwtToken');
  if (!token) window.location.href = '/login';
  return token;
};

// Inisialisasi event listener
function initEventListeners() {
  document
    .getElementById('filter-status')
    .addEventListener('change', loadTransactions);
  document
    .getElementById('sort-date')
    .addEventListener('change', loadTransactions);
}

// Memuat transaksi dengan filter
async function loadTransactions() {
  try {
    showLoading();
    const token = checkAuth();

    const status = document.getElementById('filter-status').value;
    const sort = document.getElementById('sort-date').value;

    const response = await fetch(
      `/api/transactions/user?status=${status}&sort=${sort}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) throw new Error('Gagal memuat transaksi');

    const { data } = await response.json();
    renderTransactions(data);
  } catch (error) {
    showError(error.message);
  } finally {
    hideLoading();
  }
}

// Render daftar transaksi
function renderTransactions(transactions) {
  const container = document.getElementById('transaction-list');

  if (!transactions || transactions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <img src="/user/images/empty-transaction.png" alt="No transactions">
        <p>Belum ada transaksi</p>
      </div>`;
    return;
  }

  container.innerHTML = transactions
    .map(
      (transaction) => `
    <div class="transaction-item" data-status="${transaction.payment_status}">
      <div class="transaction-header">
        <div>
          <span class="transaction-id">#${transaction.order_id}</span>
          <span class="transaction-date">
            ${new Date(transaction.created_at).toLocaleDateString()}
          </span>
        </div>
        <span class="transaction-status status-${transaction.payment_status}">
          ${transaction.payment_status}
        </span>
      </div>
      
      <div class="transaction-details">
        <div class="amount-section">
          <small>Total</small>
          <p>Rp${transaction.gross_amount.toLocaleString()}</p>
        </div>
        
        <div class="action-section">
          ${
            transaction.payment_status === 'pending'
              ? `
            <button class="continue-btn" onclick="handleContinuePayment('${transaction.order_id}')">
              <i class="fas fa-wallet"></i> Lanjutkan Pembayaran
            </button>
          `
              : `
            <button class="detail-btn" onclick="showTransactionDetail('${transaction.order_id}')">
              <i class="fas fa-info-circle"></i> Lihat Detail
            </button>
          `
          }
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// Fungsi untuk melanjutkan pembayaran
window.handleContinuePayment = async (orderId) => {
  try {
    showLoading();
    const token = checkAuth();

    const response = await fetch(`/api/transactions/${orderId}/token`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Gagal memuat token pembayaran');

    const { token: snapToken } = await response.json();

    window.snap.embed(snapToken, {
      embedId: 'snap-container',
      onSuccess: () => {
        showSuccessAlert('Pembayaran berhasil!');
        loadTransactions();
      },
      onPending: (result) => {
        console.log('Pembayaran tertunda:', result);
      },
      onError: (error) => {
        showErrorAlert(`Pembayaran gagal: ${error.message}`);
      },
    });
  } catch (error) {
    showErrorAlert(error.message);
  } finally {
    hideLoading();
  }
};

// Fungsi untuk menampilkan detail transaksi
window.showTransactionDetail = async (orderId) => {
  try {
    showLoading();
    const token = checkAuth();

    const response = await fetch(`/api/transactions/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Gagal memuat detail transaksi');

    const { data } = await response.json();
    renderTransactionDetail(data);
    openModal();
  } catch (error) {
    showErrorAlert(error.message);
  } finally {
    hideLoading();
  }
};

// Render detail transaksi di modal
function renderTransactionDetail(transaction) {
  const container = document.getElementById('transaction-detail');
  const items = JSON.parse(transaction.item_details);

  container.innerHTML = `
    <div class="detail-section">
      <h3><i class="fas fa-receipt"></i> Detail Transaksi</h3>
      <div class="detail-row">
        <span>Order ID:</span>
        <span>${transaction.order_id}</span>
      </div>
      <div class="detail-row">
        <span>Status:</span>
        <span class="status-${transaction.payment_status}">
          ${transaction.payment_status}
        </span>
      </div>
      <div class="detail-row">
        <span>Total:</span>
        <span>Rp${transaction.gross_amount.toLocaleString()}</span>
      </div>
      <div class="detail-row">
        <span>Metode Pembayaran:</span>
        <span>${transaction.payment_method || '-'}</span>
      </div>
      <div class="detail-row">
        <span>Waktu Transaksi:</span>
        <span>${new Date(transaction.transaction_time).toLocaleString()}</span>
      </div>
    </div>
    
    <div class="detail-section">
      <h3><i class="fas fa-shopping-basket"></i> Item Pembelian</h3>
      <div class="item-list">
        ${items
          .map(
            (item) => `
          <div class="item">
            <div>${item.name}</div>
            <div>${item.quantity} × Rp${item.price.toLocaleString()}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

// Fungsi modal
function initModal() {
  const modal = document.getElementById('transaction-modal');
  const closeBtn = document.querySelector('.close-modal');

  closeBtn.onclick = () => closeModal();
  window.onclick = (event) => {
    if (event.target === modal) closeModal();
  };
}

function openModal() {
  document.getElementById('transaction-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('transaction-modal').style.display = 'none';
}

// UI Helper functions
function showLoading() {
  document.getElementById('transaction-list').innerHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      Memuat transaksi...
    </div>`;
}

function hideLoading() {
  const loading = document.querySelector('.loading-indicator');
  if (loading) loading.remove();
}

function showError(message) {
  const container = document.getElementById('transaction-list');
  container.innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
      <button onclick="loadTransactions()">Coba Lagi</button>
    </div>`;
}

function showErrorAlert(message) {
  alert(`Error: ${message}`);
}

function showSuccessAlert(message) {
  alert(`Sukses: ${message}`);
}
