document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginText = document.getElementById('loginText');
  const loginSpinner = document.getElementById('loginSpinner');
  const errorAlert = document.getElementById('errorAlert');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginText.classList.add('d-none');
    loginSpinner.classList.remove('d-none');
    loginBtn.disabled = true;

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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

      Auth.saveToken(data.token, 3600);
      window.location.href = '/admin/dashboard';
    } catch (error) {
      errorAlert.textContent = error.message;
      errorAlert.classList.remove('d-none');
      setTimeout(() => errorAlert.classList.add('d-none'), 3000);
    } finally {
      loginText.classList.remove('d-none');
      loginSpinner.classList.add('d-none');
      loginBtn.disabled = false;
    }
  });
});
