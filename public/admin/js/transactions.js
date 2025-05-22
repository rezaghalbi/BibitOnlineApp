// transactions.js

let transactions = [];

// Ambil JWT dari localStorage/sessionStorage/cookie (contoh pakai localStorage)
const jwt = localStorage.getItem("jwt_token");

// Fetch data transaksi dari backend
async function fetchTransactions() {
  try {
    const res = await fetch("/api/admin/transactions", {
      headers: {
        "Authorization": `Bearer ${jwt}`
      }
    });
    if (!res.ok) throw new Error("Gagal mengambil data transaksi");
    transactions = await res.json();
    filterAndRender();
  } catch (err) {
    alert(err.message);
  }
}

// Render transactions ke tabel
function renderTransactions(data) {
  const tbody = document.getElementById("transactions-tbody");
  tbody.innerHTML = "";
  data.forEach(tx => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${tx.id}</td>
      <td>${tx.name}</td>
      <td>${Number(tx.amount).toLocaleString()}</td>
      <td>${tx.paymentStatus}</td>
      <td>${tx.date}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Search, sort, filter
function filterAndRender() {
  const search = document.getElementById("search-name").value.toLowerCase();
  const paymentStatus = document.getElementById("filter-status").value;
  const sortBy = document.getElementById("sort-by").value;

  let filtered = transactions.filter(tx =>
    tx.name.toLowerCase().includes(search) &&
    (paymentStatus === "" || tx.paymentStatus === paymentStatus)
  );

  if (sortBy === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "amount") {
    filtered.sort((a, b) => b.amount - a.amount);
  } else if (sortBy === "date") {
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  renderTransactions(filtered);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("search-name").addEventListener("input", filterAndRender);
  document.getElementById("sort-by").addEventListener("change", filterAndRender);
  document.getElementById("filter-status").addEventListener("change", filterAndRender);

  fetchTransactions();
});
