document.addEventListener('DOMContentLoaded', () => {
  const showNotification = (message, type = 'info') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      },
    });

    Toast.fire({
      icon: type,
      title: message,
    });
  };
  // Handle Login Form
  if (document.getElementById('loginForm')) {
    document
      .getElementById('loginForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
          const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
          });

          const data = await response.json();

          if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            console.log('JWT Token:', data.token);
            showNotification({
              icon: 'success',
              title: 'Login Berhasil!',
              text: 'Selamat datang kembali!',
              showConfirmButton: false,
              timer: 1500,
            });
            window.location.href = '/products';
          } else {
            alert(data.message || 'Login failed');
            showNotification({
              icon: 'error',
              title: 'Login Gagal!',
              text: data.message || 'Username atau password salah',
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred during login');
        }
      });
  }

  // Handle Registration Form
  if (document.getElementById('registerForm')) {
    document
      .getElementById('registerForm')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const userData = {
          username: document.getElementById('regUsername').value,
          password: document.getElementById('regPassword').value,
          nama_lengkap: document.getElementById('regNama').value,
          email: document.getElementById('regEmail').value,
          no_telepon: document.getElementById('regTelepon').value,
          alamat: document.getElementById('regAlamat').value,
        };

        try {
          const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (response.ok) {
            alert('Registration successful! Please login');
            window.location.href = '/login';
          } else {
            alert(data.message || 'Registration failed');
          }
        } catch (error) {
          console.error('Error:', error);
          alert('An error occurred during registration');
        }
      });
  }

  // Check authentication status
  const protectedRoutes = ['/profile', '/cart'];
  if (protectedRoutes.includes(window.location.pathname)) {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
      window.location.href = '/login';
    }
  }
});
