class Auth {
  static isAuthenticated() {
    const token = localStorage.getItem('adminToken');
    return token !== null;
  }

  static getToken() {
    return localStorage.getItem('adminToken');
  }

  static setToken(token) {
    localStorage.setItem('adminToken', token);
  }

  static removeToken() {
    localStorage.removeItem('adminToken');
  }

  static async verifyToken() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch('/api/admin/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  }

  static async redirectIfAuthenticated() {
    const isAuthenticated = await this.verifyToken();
    if (isAuthenticated) {
      window.location.href = '/admin/dashboard';
    }
  }
}
