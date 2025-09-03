const BACKEND_URL = 'http://localhost:8001';

export const authService = {
  async adminLogin(email, password) {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Importante per i cookie
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Errore di login');
      }

      const data = await response.json();
      return {
        success: true,
        account: data.account
      };
    } catch (error) {
      console.error('Errore login admin:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async logout() {
    try {
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      return { success: true };
    } catch (error) {
      console.error('Errore logout:', error);
      return { success: false, error: error.message };
    }
  }
}; 