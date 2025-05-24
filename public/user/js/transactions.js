document.addEventListener('DOMContentLoaded', () => {
  const API_CONFIG = {
    BASE_URL: 'https://6162-202-46-151-37.ngrok-free.app/api',
    ENDPOINTS: {
      TRANSACTIONS: '/transactions',
      TRANSACTION_DETAIL: '/transactions',
    },
  };

  let currentFilters = {
    status: 'all',
    paymentMethod: 'all',
    sort: 'terbaru',
  };

  const init = async () => {
    try {
      await checkAuth();
      setupEventListeners();
      await loadTransactions();
      console.log('[Init] Aplikasi siap');
    } catch (error) {
      handleError('Gagal Memulai Aplikasi', error.message);
    }
  };

  const checkAuth = () => {
    return new Promise((resolve, reject) => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        window.location.href = '/login';
        reject('Token tidak ditemukan');
      }
      resolve(token);
    });
  };

  const loadTransactions = async () => {
    try {
      const token = await checkAuth();
      const params = new URLSearchParams({
        status: currentFilters.status,
        payment_method: currentFilters.paymentMethod,
        sort: currentFilters.sort,
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Gagal memuat transaksi');
      }

      const { data } = await response.json();
      renderTransactions(data);
    } catch (error) {
      handleError('Gagal Memuat Transaksi', error.message);
    }
  };

  const renderTransactions = (transactions) => {
    const tbody = document.getElementById('transactionsBody');
    tbody.innerHTML = '';

    if (transactions.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5 text-muted">
                        <i class="fas fa-box-open fa-3x mb-3"></i>
                        <p class="h5">Tidak ada transaksi yang sesuai</p>
                    </td>
                </tr>
            `;
      return;
    }

    transactions.forEach((transaction) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${formatDate(transaction.created_at)}</td>
                <td>${transaction.order_id}</td>
                <td>${formatCurrency(transaction.gross_amount)}</td>
                <td>${renderStatusBadge(transaction.payment_status)}</td>
                <td>${transaction.payment_method || '-'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-detail" 
                            data-order-id="${transaction.order_id}"
                            title="Detail Transaksi">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });

    document.querySelectorAll('.btn-detail').forEach((button) => {
      button.addEventListener('click', showTransactionDetail);
    });
  };

  const showTransactionDetail = async (event) => {
    try {
      const orderId = event.currentTarget.dataset.orderId;
      const token = await checkAuth();

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TRANSACTIONS}/${orderId}/detail`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      if (!response.ok) throw new Error('Gagal mengambil detail transaksi');

      const { data: transaction } = await response.json();
      renderDetailModal(transaction);
    } catch (error) {
      handleError('Gagal Memuat Detail', error.message);
    }
  };

  const renderDetailModal = (transaction) => {
    const modalBody = document.getElementById('modalBodyContent');
    modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6 border-end">
                    <h5 class="fw-bold mb-3">Informasi Transaksi</h5>
                    <dl class="row">
                        <dt class="col-sm-4">Order ID</dt>
                        <dd class="col-sm-8">${transaction.order_id}</dd>
                        
                        <dt class="col-sm-4">Tanggal</dt>
                        <dd class="col-sm-8">${formatDateTime(
                          transaction.created_at
                        )}</dd>
                        
                        <dt class="col-sm-4">Status</dt>
                        <dd class="col-sm-8">${renderStatusBadge(
                          transaction.payment_status
                        )}</dd>
                    </dl>
                </div>
                
                <div class="col-md-6">
                    <h5 class="fw-bold mb-3">Pembayaran</h5>
                    <dl class="row">
                        <dt class="col-sm-4">Total</dt>
                        <dd class="col-sm-8">${formatCurrency(
                          transaction.gross_amount
                        )}</dd>
                        
                        <dt class="col-sm-4">Metode</dt>
                        <dd class="col-sm-8">${
                          transaction.payment_method || '-'
                        }</dd>
                        
                        <dt class="col-sm-4">Waktu Bayar</dt>
                        <dd class="col-sm-8">${
                          transaction.transaction_time || '-'
                        }</dd>
                    </dl>
                </div>
            </div>
            
            ${
              transaction.item_details?.length
                ? `
            <div class="mt-4">
                <h5 class="fw-bold mb-3">Item Pembelian</h5>
                <ul class="list-group">
                    ${transaction.item_details
                      .map(
                        (item) => `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-medium">${item.name}</span>
                                <small class="text-muted ms-2">(Qty: ${
                                  item.quantity
                                })</small>
                            </div>
                            <span>${formatCurrency(item.price)}</span>
                        </li>
                    `
                      )
                      .join('')}
                </ul>
            </div>
            `
                : ''
            }
        `;

    new bootstrap.Modal('#detailModal').show();
  };

  const setupEventListeners = () => {
    document
      .getElementById('statusFilter')
      .addEventListener('change', async (e) => {
        currentFilters.status = e.target.value;
        await loadTransactions();
      });

    document
      .getElementById('paymentMethodFilter')
      .addEventListener('change', async (e) => {
        currentFilters.paymentMethod = e.target.value;
        await loadTransactions();
      });

    document
      .getElementById('sortSelect')
      .addEventListener('change', async (e) => {
        currentFilters.sort = e.target.value;
        await loadTransactions();
      });

    document.getElementById('resetFilter').addEventListener('click', () => {
      currentFilters = {
        status: 'all',
        paymentMethod: 'all',
        sort: 'terbaru',
      };
      document.getElementById('statusFilter').value = 'all';
      document.getElementById('paymentMethodFilter').value = 'all';
      document.getElementById('sortSelect').value = 'terbaru';
      loadTransactions();
    });
  };

  // Helper functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderStatusBadge = (status) => {
    const statusClasses = {
      pending: 'bg-warning text-dark',
      settlement: 'bg-success text-white',
      cancel: 'bg-danger text-white',
      expire: 'bg-secondary text-white',
    };
    return `<span class="badge ${statusClasses[status]}">${status}</span>`;
  };

  const handleError = (title, message) => {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      timer: 5000,
    });
  };

  init();
});
