document.addEventListener('DOMContentLoaded', async () => {
  // Fungsi validasi autentikasi
  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    console.log('Token:', token); // tambahkan ini
    if (!token) {
      window.location.href = '/login';
      return null;
    }
    return token;
  };

  // Load data transaksi
  const loadTransactions = async () => {
    try {
      const token = checkAuth();
      console.log('Token:', token);

      const response = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memuat transaksi');

      const transactions = await response.json();
      renderTransactions(transactions);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Transaksi',
        text: error.message,
      });
    }
  };

  // Render data transaksi ke tabel
  const renderTransactions = (transactions) => {
    const tbody = document.querySelector('#transactionsContainer tbody');
    tbody.innerHTML = '';

    transactions.forEach((transaction) => {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${new Date(transaction.created_at).toLocaleDateString()}</td>
        <td>${transaction.order_id}</td>
        <td>Rp ${transaction.gross_amount.toLocaleString()}</td>
        <td><span class="badge ${getStatusClass(transaction.payment_status)}">
          ${transaction.payment_status}
        </span></td>
        <td>
          <button class="btn btn-sm btn-detail" data-id="${transaction.id}">
            <i class="fas fa-info-circle"></i>
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    // Tambahkan event listener untuk tombol detail
    document.querySelectorAll('.btn-detail').forEach((button) => {
      button.addEventListener('click', showTransactionDetail);
    });
  };

  // Fungsi helper untuk status transaksi
  const getStatusClass = (status) => {
    const statusMap = {
      pending: 'bg-warning text-dark',
      settlement: 'bg-success',
      cancel: 'bg-danger',
    };
    return statusMap[status] || 'bg-secondary';
  };

  // Handle tampilkan detail transaksi
  const showTransactionDetail = async (e) => {
    const transactionId = e.currentTarget.dataset.id;
    try {
      const token = checkAuth();
      const response = await fetch(`/api/transactions/${transactionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memuat detail transaksi');

      const transaction = await response.json();
      renderDetailModal(transaction);
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Detail',
        text: error.message,
      });
    }
  };

  // Render modal detail
  const renderDetailModal = (transaction) => {
    const modalBody = document.querySelector('#detailModal .modal-body');

    modalBody.innerHTML = `
      <div class="row">
        <div class="col-md-6">
          <h5>Informasi Transaksi</h5>
          <p>ID: ${transaction.order_id}</p>
          <p>Tanggal: ${new Date(transaction.created_at).toLocaleString()}</p>
          <p>Status: <span class="badge ${getStatusClass(
            transaction.payment_status
          )}">
            ${transaction.payment_status}
          </span></p>
        </div>
        <div class="col-md-6">
          <h5>Detail Pembayaran</h5>
          <p>Total: Rp ${transaction.gross_amount.toLocaleString()}</p>
          <p>Metode: ${transaction.payment_method || '-'}</p>
        </div>
      </div>
      <div class="mt-3">
        <h5>Item Pembelian</h5>
        <ul class="list-group">
          ${transaction.item_details
            .map(
              (item) => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${item.name} (${item.quantity}x)</span>
              <span>Rp ${item.price.toLocaleString()}</span>
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    `;

    // Tampilkan modal
    new bootstrap.Modal(document.getElementById('detailModal')).show();
  };

  // Inisialisasi pertama
  try {
    await loadTransactions();
  } catch (error) {
    console.error('Initialization error:', error);
  }
});
