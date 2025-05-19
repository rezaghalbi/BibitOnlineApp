document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in
  await Auth.redirectIfAuthenticated();

  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginText = document.getElementById('loginText');
  const loginSpinner = document.getElementById('loginSpinner');
  const errorAlert = document.getElementById('errorAlert');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Show loading state
    loginText.textContent = 'Logging in...';
    loginSpinner.classList.remove('d-none');
    loginBtn.disabled = true;

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and redirect
      Auth.setToken(data.token);
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('Login error:', error);

      // Show error message
      errorAlert.textContent = error.message;
      errorAlert.classList.remove('d-none');

      // Hide error message after 5 seconds
      setTimeout(() => {
        errorAlert.classList.add('d-none');
      }, 5000);
    } finally {
      // Reset button state
      loginText.textContent = 'Login';
      loginSpinner.classList.add('d-none');
      loginBtn.disabled = false;
    }
  });

  // Add animation to form elements on load
  const formElements = loginForm.querySelectorAll('.form-control, .btn');
  formElements.forEach((el, index) => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.transition = `all 0.5s ease ${index * 0.1}s`;

    setTimeout(() => {
      el.style.opacity = 1;
      el.style.transform = 'translateY(0)';
    }, 100);
  });
});
