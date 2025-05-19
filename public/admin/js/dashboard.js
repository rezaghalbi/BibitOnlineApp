document.addEventListener('DOMContentLoaded', async () => {
  // Load partials
  await loadPartials();

  // Check authentication
  if (!Auth.isAuthenticated()) {
    window.location.href = '/admin/login';
    return;
  }

  // Set admin username
  const token = Auth.getToken();
  const decoded = jwt_decode(token);
  document.getElementById('adminUsername').textContent =
    decoded.username || 'Admin';

  // Load dashboard stats
  await loadDashboardStats();

  // Load recent transactions
  await loadRecentTransactions();

  // Setup event listeners
  setupEventListeners();

  // Initialize chart
  initChart();
});

async function loadPartials() {
  try {
    const header = await fetch('partials/header.html').then((res) =>
      res.text()
    );
    const sidebar = await fetch('partials/sidebar.html').then((res) =>
      res.text()
    );
    const footer = await fetch('partials/footer.html').then((res) =>
      res.text()
    );

    document.getElementById('header-container').innerHTML = header;
    document.getElementById('sidebar-container').innerHTML = sidebar;
    document.getElementById('footer-container').innerHTML = footer;
  } catch (error) {
    console.error('Error loading partials:', error);
  }
}

async function loadDashboardStats() {
  try {
    const token = Auth.getToken();

    const [usersRes, productsRes, transactionsRes] = await Promise.all([
      fetch('/api/users/count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch('/api/products/count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      fetch('/api/transactions/count', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    ]);

    const usersCount = await usersRes.json();
    const productsCount = await productsRes.json();
    const transactionsCount = await transactionsRes.json();

    document.getElementById('totalUsers').textContent = usersCount.total || 0;
    document.getElementById('totalProducts').textContent =
      productsCount.total || 0;
    document.getElementById('totalTransactions').textContent =
      transactionsCount.total || 0;
  } catch (error) {
    console.error('Error loading dashboard stats:', error);
  }
}

async function loadRecentTransactions() {
  try {
    const token = Auth.getToken();
    const response = await fetch('/api/transactions/recent', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const transactions = await response.json();
    const tbody = document.getElementById('recentTransactions');
    tbody.innerHTML = '';

    transactions.forEach((transaction) => {
      const tr = document.createElement('tr');
      tr.className = 'fade-in';

      let statusClass = '';
      switch (transaction.status) {
        case 'completed':
          statusClass = 'badge-success';
          break;
        case 'pending':
          statusClass = 'badge-warning';
          break;
        case 'failed':
          statusClass = 'badge-danger';
          break;
        default:
          statusClass = 'badge-secondary';
      }

      tr.innerHTML = `
                <td>${transaction.id}</td>
                <td>${transaction.user_name || 'N/A'}</td>
                <td>$${transaction.amount.toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${
        transaction.status
      }</span></td>
                <td>${new Date(
                  transaction.created_at
                ).toLocaleDateString()}</td>
            `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error('Error loading recent transactions:', error);
  }
}

function setupEventListeners() {
  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('active');
    document.querySelector('.main-content').classList.toggle('active');
  });

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', () => {
    Auth.removeToken();
    window.location.href = '/admin/login';
  });
}

function initChart() {
  const ctx = document.createElement('canvas');
  ctx.id = 'dashboardChart';
  document.querySelector('.card-body').prepend(ctx);

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Transactions',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(78, 115, 223, 0.05)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 2,
          pointBackgroundColor: 'rgba(78, 115, 223, 1)',
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: true,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}
