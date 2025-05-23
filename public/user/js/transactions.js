function checkAuth() {
  if (!localStorage.getItem('jwtToken')) {
    window.location.href = '/login';
  }
}

async function loadTransactions() {
  try {
    const status = document.getElementById('statusFilter').value;
    const sort = document.getElementById('sortFilter').value;

    const response = await fetch(
      `/api/transactions/user?status=${status}&sort=${sort}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );

    const { data } = await response.json();
    renderTransactions(data);
  } catch (error) {
    console.error('Error:', error);
  }
}

function renderTransactions(transactions) {
  const container = document.getElementById('transactionsList');
  container.innerHTML = '';

  transactions.forEach((transaction) => {
    const transactionEl = document.createElement('div');
    transactionEl.className = 'transaction-card';
    transactionEl.innerHTML = `
            <div class="transaction-header">
                <span>#${transaction.order_id}</span>
                <div class="status-badge status-${transaction.payment_status}">
                    ${transaction.payment_status}
                </div>
            </div>
            <p>Total: Rp ${transaction.gross_amount.toLocaleString()}</p>
            <p>Tanggal: ${new Date(
              transaction.created_at
            ).toLocaleDateString()}</p>
        `;

    transactionEl.addEventListener('click', () => {
      window.location.href = `/transaction-detail.html?order_id=${transaction.order_id}`;
    });

    container.appendChild(transactionEl);
  });
}

// Handle continue payment
window.handleContinuePayment = async (orderId) => {
  try {
    const token = localStorage.getItem('jwtToken');

    const response = await fetch(`/api/transactions/${orderId}/payment`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(await response.text());

    const { token: snapToken } = await response.json();
    window.snap.embed(snapToken, {
      embedId: 'snap-container',
      onSuccess: () => window.location.reload(),
    });
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Show transaction detail
window.showDetail = async (orderId) => {
  try {
    const token = localStorage.getItem('jwtToken');

    const response = await fetch(`/api/transactions/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(await response.text());

    const { data } = await response.json();
    renderDetailModal(data);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

function renderDetailModal(transaction) {
  const modal = document.getElementById('transaction-detail-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Detail Transaksi #${transaction.order_id}</h3>
      <div class="detail-section">
        <p><strong>Status:</strong> <span class="status ${
          transaction.payment_status
        }">${transaction.payment_status}</span></p>
        <p><strong>Total:</strong> Rp${transaction.gross_amount.toLocaleString()}</p>
        <p><strong>Metode Pembayaran:</strong> ${
          transaction.payment_method || '-'
        }</p>
        <p><strong>Tanggal:</strong> ${new Date(
          transaction.created_at
        ).toLocaleString()}</p>
      </div>
      
      <div class="items-section">
        <h4>Item Pembelian:</h4>
        ${transaction.item_details
          .map(
            (item) => `
          <div class="item">
            <span>${item.name}</span>
            <span>${item.quantity} × Rp${item.price.toLocaleString()}</span>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
  modal.style.display = 'block';
}
