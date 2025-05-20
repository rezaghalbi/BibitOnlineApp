// File: public/admin/js/users.js

// Fungsi untuk menampilkan alert
function showAlert(message, type = 'danger') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 1050;';
  alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

  document.body.appendChild(alertDiv);

  // Auto remove setelah 5 detik
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Debug authentication
    Auth.debug();

    if (!Auth.isAuthenticated()) {
      window.location.href = '/admin/login';
      return;
    }

    await loadHeader();
    await loadUsers();
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showAlert(`Terjadi kesalahan: ${error.message}`);
  }
});

async function loadHeader() {
  try {
    const response = await fetch('/admin/partials/header.html');
    if (!response.ok) throw new Error('Gagal memuat header');

    const headerHTML = await response.text();
    document.getElementById('header-container').innerHTML = headerHTML;

    document.getElementById('logoutBtn').addEventListener('click', Auth.logout);
  } catch (error) {
    throw new Error(`Error header: ${error.message}`);
  }
}

async function loadUsers(search = '', sortBy = 'username', order = 'asc') {
  try {
    const token = Auth.getToken();
    const url = new URL('/api/users', window.location.origin);
    url.searchParams.append('search', search);
    url.searchParams.append('sortBy', sortBy);
    url.searchParams.append('order', order);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const users = await response.json();
    renderUsers(users);
  } catch (error) {
    showAlert(`Gagal memuat data user: ${error.message}`);
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('usersTableBody');
  tbody.innerHTML = users
    .map(
      (user) => `
        <tr>
            <td>${user.username}</td>
            <td>${user.nama_lengkap}</td>
            <td>${user.email}</td>
            <td>${user.no_telepon || '-'}</td>
            <td>${user.alamat || '-'}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${
                  user.user_id
                }">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                  user.user_id
                }">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `
    )
    .join('');

  // Event listeners untuk tombol
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleDeleteUser(btn.dataset.id));
  });

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => showEditForm(btn.dataset.id));
  });
}

function setupEventListeners() {
  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => {
    loadUsers(e.target.value);
  });

  // Sorting
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    const [sortBy, order] = e.target.value.split(':');
    loadUsers(document.getElementById('searchInput').value, sortBy, order);
  });

  // Edit form submission
  document
    .getElementById('editUserForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleUpdateUser();
    });
}

async function handleDeleteUser(userId) {
  if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;

  try {
    const token = Auth.getToken();
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Gagal menghapus user');

    await loadUsers();
    showAlert('User berhasil dihapus', 'success');
  } catch (error) {
    showAlert(`Gagal menghapus user: ${error.message}`);
  }
}

async function showEditForm(userId) {
  try {
    const token = Auth.getToken();
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Gagal memuat data user');

    const user = await response.json();

    // Isi form
    document.getElementById('editUserId').value = user.user_id;
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editFullName').value = user.nama_lengkap;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.no_telepon || '';
    document.getElementById('editAddress').value = user.alamat || '';

    // Tampilkan modal
    new bootstrap.Modal(document.getElementById('editUserModal')).show();
  } catch (error) {
    showAlert(`Gagal memuat data user: ${error.message}`);
  }
}

async function handleUpdateUser() {
  try {
    const userId = document.getElementById('editUserId').value;
    const token = Auth.getToken();

    const updatedData = {
      username: document.getElementById('editUsername').value,
      nama_lengkap: document.getElementById('editFullName').value,
      email: document.getElementById('editEmail').value,
      no_telepon: document.getElementById('editPhone').value,
      alamat: document.getElementById('editAddress').value,
    };

    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) throw new Error('Gagal memperbarui user');

    await loadUsers();

    const modalElement = document.getElementById('editUserModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    if (modal) {
      modal.hide();
    } else {
      new bootstrap.Modal(modalElement).hide();
    }

    showAlert('User berhasil diperbarui', 'success');
  } catch (error) {
    showAlert(`Gagal memperbarui user: ${error.message}`);
  }
}
