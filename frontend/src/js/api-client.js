// HTTP client for calling the Restaurant Booking API

import { AuthService } from './auth-service.js';

export class ApiClient {
  constructor(baseUrl = 'http://localhost:5001/api') {
    this.baseUrl = baseUrl;
  }

  // Helper method to make HTTP requests
  async request(endpoint, options = {}) {
    const token = AuthService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge with any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An error occurred' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return {};
    }

    return response.json();
  }

  // Authentication methods
  async register(data) {
    await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Save token after successful login
    AuthService.saveToken(response.token);
    
    return response;
  }

  logout() {
    AuthService.removeToken();
  }

  // Tables methods
  async getTables() {
    return this.request('/tables');
  }

  async getAvailableTables(date, timeSlot) {
    const params = new URLSearchParams({ date, timeSlot });
    return this.request(`/tables/available?${params}`);
  }

  async createTable(table) {
    return this.request('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    });
  }

  async updateTable(id, table) {
    await this.request(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    });
  }

  async deleteTable(id) {
    await this.request(`/tables/${id}`, {
      method: 'DELETE',
    });
  }

  // Bookings methods
  async createBooking(booking) {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    });
  }

  async getMyBookings() {
    return this.request('/bookings/my');
  }

  async cancelBooking(id) {
    await this.request(`/bookings/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllBookings(date, status) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (status) params.append('status', status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings';
    
    return this.request(endpoint);
  }

  async getTableBookings(tableId) {
    return this.request(`/bookings/table/${tableId}`);
  }

  // Helper methods
  isAuthenticated() {
    return AuthService.isLoggedIn();
  }
}
