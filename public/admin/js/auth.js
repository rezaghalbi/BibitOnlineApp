// File: public/admin/js/auth.js
const Auth = {
  saveToken: function (token) {
    localStorage.setItem('adminToken', token);
  },

  getToken: function () {
    return localStorage.getItem('adminToken');
  },

  isAuthenticated: function () {
    return !!this.getToken();
  },

  logout: function () {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  },

  debug: function () {
    console.log('Auth Status:', {
      token: this.getToken(),
      isAuthenticated: this.isAuthenticated(),
    });
  },
};

window.Auth = Auth;
