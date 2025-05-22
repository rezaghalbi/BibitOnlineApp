document.addEventListener('DOMContentLoaded', async () => {
  const checkAuth = () => {
    const token = localStorage.getItem('jwtToken');
    if (!token) window.location.href = '/login';
    return token;
  };

  // Load user data
  const loadUserProfile = async () => {
    try {
      const token = checkAuth();
      const response = await fetch('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Gagal memuat profil');

      const userData = await response.json();

      // Populate form
      document.getElementById('username').value = userData.username;
      document.getElementById('nama_lengkap').value = userData.nama_lengkap;
      document.getElementById('email').value = userData.email;
      document.getElementById('no_telepon').value = userData.no_telepon;
      document.getElementById('alamat').value = userData.alamat;
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memuat Profil',
        text: error.message,
      });
    }
  };

  // Handle form submission
  document
    .getElementById('profileForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

      try {
        const token = checkAuth();
        const formData = {
          username: document.getElementById('username').value,
          nama_lengkap: document.getElementById('nama_lengkap').value,
          email: document.getElementById('email').value,
          no_telepon: document.getElementById('no_telepon').value,
          alamat: document.getElementById('alamat').value,
          newPassword: document.getElementById('newPassword').value,
          confirmPassword: document.getElementById('confirmPassword').value,
        };

        // Password validation
        if (formData.newPassword || formData.confirmPassword) {
          if (formData.newPassword !== formData.confirmPassword) {
            throw new Error(
              'Password baru dan konfirmasi password tidak cocok'
            );
          }
        }

        const response = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Gagal memperbarui profil');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Profil berhasil diperbarui',
          timer: 1500,
          showConfirmButton: false,
        });

        // Clear password fields
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menyimpan',
          text: error.message,
        });
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save me-2"></i>Simpan Perubahan';
      }
    });

  // Initial load
  await loadUserProfile();
});
