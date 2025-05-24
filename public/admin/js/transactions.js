// admin/js/transactions.js
import { loadHeader } from './admin-common.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = '/admin/login';
    return;
  }

  await loadHeader();
  await loadTransactions();
  setupEventListeners();
});

async function loadTransactions() {
  try {
    const token = Auth.getToken();
    const search = document.getElementById('searchInput').value;
    const status = document.getElementById('statusFilter').value;
    const sort = document.getElementById('sortSelect').value;

    const response = await fetch(
      `/api/transactions/admin?search=${encodeURIComponent(
        search
      )}&status=${status}&sort=${sort}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) throw new Error('Gagal memuat transaksi');

    const data = await response.json();
    console.log('DATA RESPONSE DARI API:', data);

    const transactions = data.data;
    renderTransactions(transactions);
  } catch (error) {
    showAlert('danger', 'Gagal memuat data transaksi');
    console.error('Fetch error:', error); // Tambahkan ini
    showAlert('danger', 'Gagal memuat data transaksi');
  }
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionsTableBody');
  tbody.innerHTML =
    transactions.length === 0
      ? `
        <tr>
            <td colspan="7" class="text-center">Tidak ada transaksi</td>
        </tr>
    `
      : transactions
          .map(
            (transaction) => `
        <tr>
            <td>${transaction.order_id}</td>
            <td>
                <div class="transaction-detail" title="${
                  transaction.customer_name
                }">
                    ${transaction.customer_name}
                </div>
            </td>
            <td>Rp${transaction.gross_amount.toLocaleString()}</td>
            <td>
                <span class="status-badge status-${transaction.payment_status}">
                    ${getStatusLabel(transaction.payment_status)}
                </span>
            </td>
            <td>${transaction.payment_method || '-'}</td>
            <td>${new Date(transaction.transaction_time).toLocaleString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" 
                    onclick="viewDetail('${transaction.order_id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `
          )
          .join('');

  // Update event listeners jika diperlukan
}

function getStatusLabel(status) {
  const statusLabels = {
    pending: 'Menunggu Pembayaran',
    settlement: 'Sukses',
    cancel: 'Dibatalkan',
    expire: 'Kadaluarsa',
  };
  return statusLabels[status] || status;
}

function setupEventListeners() {
  document
    .getElementById('searchInput')
    .addEventListener('input', loadTransactions);
  document
    .getElementById('statusFilter')
    .addEventListener('change', loadTransactions);
  document
    .getElementById('sortSelect')
    .addEventListener('change', loadTransactions);
}

function viewDetail(orderId) {
  window.location.href = `/admin/transactions/${orderId}`;
}

// Fungsi showAlert sama dengan yang di products.js
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
