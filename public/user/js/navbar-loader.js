document.addEventListener('DOMContentLoaded', () => {
  const loadNavbar = async () => {
    try {
      const response = await fetch('/user/partials/navbar.html');
      if (!response.ok) throw new Error('Gagal memuat navbar');

      const html = await response.text();
      document.body.insertAdjacentHTML('afterbegin', html);

      // Logout functionality
      document.getElementById('logoutBtn').addEventListener('click', () => {
        
        localStorage.removeItem('jwtToken');
        window.location.href = '/login';
      });

      // Highlight active link
      const currentPath = window.location.pathname;
      document.querySelectorAll('.nav-link').forEach((link) => {
        if (link.getAttribute('href') === currentPath) {
          link.classList.add('active');
        }
      });
    } catch (error) {
      console.error('Error loading navbar:', error);
    }
  };

  loadNavbar();
});
