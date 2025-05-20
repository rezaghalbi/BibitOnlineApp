document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.isAuthenticated()) {
    window.location.href = '/admin/login';
    return;
  }

  await loadPartials();
  await loadDashboardData();
  setupEventListeners();
});

async function loadPartials() {
  try {
    const [header, footer] = await Promise.all([
      fetch('/admin/partials/header.html').then((res) => res.text()),
      fetch('/admin/partials/footer.html').then((res) => res.text()),
    ]);

    document.getElementById('header-container').innerHTML = header;
    document.getElementById('footer-container').innerHTML = footer;

    // document.getElementById('adminName').textContent = Auth.getAdminName();
  } catch (error) {
    console.error('Error loading partials:', error);
  }
}

async function loadDashboardData() {
  try {
    console.log('Loading dashboard data...');
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch stats');
    }

    const result = await response.json();
    console.log('API success response:', result);

    // Update UI
    document.getElementById('totalProducts').textContent = result.data.products;
    document.getElementById('totalTransactions').textContent =
      result.data.transactions;
    document.getElementById('totalUsers').textContent = result.data.users;
  } catch (error) {
    console.error('Dashboard error:', error);
    showError(`Gagal memuat data: ${error.message}`);
  }
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger alert-dismissible fade show';
  errorDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  document.querySelector('main').prepend(errorDiv);
}

function setupEventListeners() {
  document.getElementById('logoutBtn').addEventListener('click', Auth.logout);

  // Animasi hover untuk action cards
  const actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('i');
      icon.style.transform = 'scale(1.1)';
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('i');
      icon.style.transform = 'scale(1)';
    });
  });
}
