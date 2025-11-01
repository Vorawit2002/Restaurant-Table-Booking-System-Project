// Authentication service for managing JWT tokens

export class AuthService {
  static TOKEN_KEY = 'jwt_token';

  static saveToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isLoggedIn() {
    return this.getToken() !== null;
  }

  static getUserFromToken() {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Decode JWT token (payload is the middle part)
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const userData = JSON.parse(decodedPayload);

      return {
        id: userData.userId || userData.sub,
        username: userData.username || '',
        email: userData.email || '',
        fullName: userData.fullName || '',
        phoneNumber: userData.phoneNumber || '',
        role: userData.role || 'customer'
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  static isAdmin() {
    const user = this.getUserFromToken();
    return user?.role === 'admin';
  }
}
