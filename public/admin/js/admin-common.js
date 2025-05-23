export async function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  const response = await fetch('/admin/partials/header.html');
  headerContainer.innerHTML = await response.text();
}

export function setupLogout() {
  window.logout = function () {
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/admin/login';
  };
}
