const Auth = {
  saveToken: (token, expiresIn) => {
    const expiry = Date.now() + expiresIn * 1000;
    localStorage.setItem('adminToken', token);
    localStorage.setItem('tokenExpiry', expiry);
  },

  getToken: () => localStorage.getItem('adminToken'),

  isAuthenticated: () => {
    const token = Auth.getToken();
    const expiry = localStorage.getItem('tokenExpiry');
    return token && Date.now() < expiry;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('tokenExpiry');
    window.location.href = '/admin/login';
  },

  getAdminId: () => {
    const token = Auth.getToken();
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.adminId;
  },
};
