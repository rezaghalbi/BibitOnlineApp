import { loadHeader, setupLogout } from './admin-common.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader(); // <-- Ganti dari loadNavbar ke loadHeader
  setupLogout();

  // Event Listeners
  document
    .getElementById('searchInput')
    .addEventListener('input', fetchTransactions);
  document
    .getElementById('statusFilter')
    .addEventListener('change', fetchTransactions);
  document
    .getElementById('sortSelect')
    .addEventListener('change', fetchTransactions);

  // Initial load
  await fetchTransactions();
});

async function fetchTransactions() {
  const token = document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];
  const search = document.getElementById('searchInput').value;
  const status = document.getElementById('statusFilter').value;
  const sort = document.getElementById('sortSelect').value;

  try {
    const response = await fetch(
      `/api/transactions/admin?search=${encodeURIComponent(
        search
      )}&status=${status}&sort=${sort}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.status === 401) {
      window.location.href = '/admin/login';
      return;
    }

    const { data } = await response.json();
    renderTransactions(data);
  } catch (error) {
    console.error('Error:', error);
    alert('Gagal memuat data transaksi');
  }
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionsTableBody');
  tbody.innerHTML = '';

  transactions.forEach((transaction) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${transaction.order_id}</td>
            <td>${transaction.customer_name}</td>
            <td>Rp ${transaction.gross_amount.toLocaleString()}</td>
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
                    Detail
                </button>
            </td>
        `;
    tbody.appendChild(row);
  });
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Menunggu Pembayaran',
    settlement: 'Sukses',
    cancel: 'Dibatalkan',
    expire: 'Kadaluarsa',
    refund: 'Dikembalikan',
  };
  return labels[status] || status;
}

window.viewDetail = function (orderId) {
  window.location.href = `/admin/transactions/${orderId}`;
};
