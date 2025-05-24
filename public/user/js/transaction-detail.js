// document.addEventListener('DOMContentLoaded', async () => {
//   await loadNavbar();
//   await loadTransactionDetail();
// });

// async function loadTransactionDetail() {
//   const urlParams = new URLSearchParams(window.location.search);
//   const orderId = urlParams.get('order_id');

//   try {
//     const response = await fetch(`/api/transactions/${orderId}`, {
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`,
//       },
//     });

//     const { data } = await response.json();
//     renderTransactionDetail(data);
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// function renderTransactionDetail(transaction) {
//   document.getElementById('orderId').textContent = transaction.order_id;
//   document.getElementById('totalAmount').textContent =
//     transaction.gross_amount.toLocaleString();
//   document.getElementById('transactionDate').textContent = new Date(
//     transaction.created_at
//   ).toLocaleString();

//   // Status badge
//   const statusBadge = document.getElementById('statusBadge');
//   statusBadge.className = `status-badge status-${transaction.payment_status}`;
//   statusBadge.textContent = transaction.payment_status;

//   // Items list
//   const itemsList = document.getElementById('itemsList');
//   itemsList.innerHTML = transaction.item_details
//     .map(
//       (item) => `
//             <div class="item-card">
//                 <h4>${item.name}</h4>
//                 <p>${item.jumlah} x Rp ${item.price.toLocaleString()}</p>
//             </div>
//         `
//     )
//     .join('');

//   // Tampilkan tombol aksi hanya untuk status pending
//   const actionButtons = document.getElementById('actionButtons');
//   actionButtons.style.display =
//     transaction.payment_status === 'pending' ? 'flex' : 'none';
// }

// async function handleCancelTransaction() {
//   const orderId = document.getElementById('orderId').textContent;

//   try {
//     const response = await fetch(`/api/transactions/${orderId}/status`, {
//       method: 'PUT',
//       headers: {
//         Authorization: `Bearer ${localStorage.getItem('token')}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status: 'cancel' }),
//     });

//     if (response.ok) {
//       alert('Transaksi berhasil dibatalkan');
//       window.location.reload();
//     }
//   } catch (error) {
//     console.error('Error:', error);
//   }
// }

// function handleContinuePayment() {
//   const orderId = document.getElementById('orderId').textContent;
//   window.location.href = `/payment.html?order_id=${orderId}`;
// }
