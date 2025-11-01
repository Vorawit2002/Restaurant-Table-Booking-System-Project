// Admin Dashboard

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

// Check authentication immediately
if (!AuthService.isLoggedIn()) {
  window.location.href = 'login.html';
} else if (!AuthService.isAdmin()) {
  alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
  window.location.href = 'index.html';
}

// Check authentication and admin role
function checkAdminAccess() {
  if (!AuthService.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  if (!AuthService.isAdmin()) {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    window.location.href = 'index.html';
    return;
  }

  // Display user info
  const user = AuthService.getUserFromToken();
  if (user) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
      userDisplay.textContent = `Admin: ${user.fullName}`;
    }
  }
}

// Display message
function showMessage(message, type) {
  const container = document.getElementById('messageContainer');
  if (!container) return;

  const messageDiv = document.createElement('div');
  messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
  messageDiv.textContent = message;
  
  container.innerHTML = '';
  container.appendChild(messageDiv);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Show/hide loading indicator
function setLoading(isLoading) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  if (loadingIndicator) {
    if (isLoading) {
      loadingIndicator.classList.remove('hidden');
    } else {
      loadingIndicator.classList.add('hidden');
    }
  }
}

// Get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Load dashboard statistics
async function loadStatistics() {
  try {
    setLoading(true);

    // Get today's date
    const today = getTodayDate();

    // Fetch all bookings for today
    const allBookings = await apiClient.getAllBookings(today);
    
    // Fetch all tables
    const tables = await apiClient.getTables();

    // Calculate statistics
    const todayBookings = allBookings.filter(b => b.bookingDate === today);
    const confirmedBookings = todayBookings.filter(b => b.status === 'confirmed');
    const cancelledBookings = todayBookings.filter(b => b.status === 'cancelled');

    // Update statistics display
    updateStatistic('todayBookingsCount', todayBookings.length);
    updateStatistic('confirmedBookingsCount', confirmedBookings.length);
    updateStatistic('cancelledBookingsCount', cancelledBookings.length);
    updateStatistic('totalTablesCount', tables.length);

    // Display today's bookings
    displayTodayBookings(todayBookings);

  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'}`, 'error');
  } finally {
    setLoading(false);
  }
}

// Update statistic display
function updateStatistic(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value.toString();
  }
}

// Display today's bookings
function displayTodayBookings(bookings) {
  const bookingsList = document.getElementById('todayBookingsList');
  const noBookingsToday = document.getElementById('noBookingsToday');

  if (!bookingsList || !noBookingsToday) return;

  bookingsList.innerHTML = '';

  if (bookings.length === 0) {
    noBookingsToday.classList.remove('hidden');
    return;
  }

  noBookingsToday.classList.add('hidden');

  // Sort bookings by time slot
  const sortedBookings = [...bookings].sort((a, b) => {
    return a.timeSlot.localeCompare(b.timeSlot);
  });

  sortedBookings.forEach(booking => {
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';
    
    const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
    const statusText = booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว';

    bookingItem.innerHTML = `
      <div class="booking-info">
        <div class="booking-field">
          <label>เลขที่การจอง</label>
          <span class="booking-reference">${booking.reference}</span>
        </div>
        <div class="booking-field">
          <label>ชื่อลูกค้า</label>
          <span>${booking.userName}</span>
        </div>
        <div class="booking-field">
          <label>โต๊ะ</label>
          <span>${booking.tableNumber}</span>
        </div>
        <div class="booking-field">
          <label>จำนวนคน</label>
          <span>${booking.numberOfGuests} คน</span>
        </div>
        <div class="booking-field">
          <label>ช่วงเวลา</label>
          <span>${booking.timeSlot}</span>
        </div>
        <div class="booking-field">
          <label>สถานะ</label>
          <span class="booking-status ${statusClass}">${statusText}</span>
        </div>
      </div>
    `;

    bookingsList.appendChild(bookingItem);
  });
}

// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  loadStatistics();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
