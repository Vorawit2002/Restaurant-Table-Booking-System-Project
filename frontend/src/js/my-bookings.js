// My Bookings page - View and manage user's bookings

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();
let allBookings = [];
let bookingToCancel = null;

// Check authentication on page load
function checkAuthentication() {
  if (!AuthService.isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  // Display user info
  const user = AuthService.getUserFromToken();
  if (user) {
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
      userDisplay.textContent = `สวัสดี, ${user.fullName}`;
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
  const bookingsContainer = document.getElementById('bookingsContainer');

  if (loadingIndicator) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }
  if (bookingsContainer) {
    bookingsContainer.style.display = isLoading ? 'none' : 'block';
  }
}

// Format date to Thai format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  };
  return date.toLocaleDateString('th-TH', options);
}

// Check if booking is upcoming
function isUpcoming(booking) {
  const bookingDate = new Date(booking.bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate >= today && booking.status === 'confirmed';
}

// Check if booking is past
function isPast(booking) {
  const bookingDate = new Date(booking.bookingDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return bookingDate < today && booking.status === 'confirmed';
}

// Filter bookings based on selected status
function filterBookings(status) {
  switch (status) {
    case 'upcoming':
      return allBookings.filter(isUpcoming);
    case 'past':
      return allBookings.filter(isPast);
    case 'cancelled':
      return allBookings.filter(b => b.status === 'cancelled');
    default:
      return allBookings;
  }
}

// Display bookings
function displayBookings(bookings) {
  const bookingsList = document.getElementById('bookingsList');
  const emptyState = document.getElementById('emptyState');

  if (!bookingsList || !emptyState) return;

  bookingsList.innerHTML = '';

  if (bookings.length === 0) {
    bookingsList.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  bookingsList.style.display = 'flex';
  emptyState.style.display = 'none';

  bookings.forEach(booking => {
    const bookingItem = document.createElement('div');
    bookingItem.className = 'booking-item';

    const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
    const statusText = booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว';
    const canCancel = isUpcoming(booking);

    bookingItem.innerHTML = `
      <div class="booking-info">
        <div class="booking-field">
          <label>เลขที่การจอง</label>
          <span class="booking-reference">${booking.reference}</span>
        </div>
        <div class="booking-field">
          <label>โต๊ะ</label>
          <span>โต๊ะ ${booking.tableNumber}</span>
        </div>
        <div class="booking-field">
          <label>วันที่</label>
          <span>${formatDate(booking.bookingDate)}</span>
        </div>
        <div class="booking-field">
          <label>เวลา</label>
          <span>${booking.timeSlot}</span>
        </div>
        <div class="booking-field">
          <label>จำนวนคน</label>
          <span>${booking.numberOfGuests} คน</span>
        </div>
        <div class="booking-field">
          <label>สถานะ</label>
          <span class="booking-status ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="booking-actions">
        ${canCancel ? `<button class="btn btn-cancel" data-booking-id="${booking.id}">ยกเลิกการจอง</button>` : ''}
      </div>
    `;

    bookingsList.appendChild(bookingItem);
  });

  // Add event listeners to cancel buttons
  const cancelButtons = document.querySelectorAll('.btn-cancel');
  cancelButtons.forEach(button => {
    button.addEventListener('click', handleCancelClick);
  });
}

// Load bookings from API
async function loadBookings() {
  try {
    setLoading(true);
    allBookings = await apiClient.getMyBookings();
    
    // Sort by date (newest first)
    allBookings.sort((a, b) => {
      return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
    });

    const statusFilter = document.getElementById('statusFilter');
    const selectedStatus = statusFilter ? statusFilter.value : 'all';
    const filteredBookings = filterBookings(selectedStatus);
    
    displayBookings(filteredBookings);
  } catch (error) {
    showMessage(
      `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'}`,
      'error'
    );
  } finally {
    setLoading(false);
  }
}

// Handle filter change
function handleFilterChange() {
  const statusFilter = document.getElementById('statusFilter');
  if (!statusFilter) return;

  const selectedStatus = statusFilter.value;
  const filteredBookings = filterBookings(selectedStatus);
  displayBookings(filteredBookings);
}

// Handle cancel button click
function handleCancelClick(event) {
  const button = event.target;
  const bookingId = button.getAttribute('data-booking-id');
  
  if (bookingId) {
    bookingToCancel = parseInt(bookingId);
    showCancelModal();
  }
}

// Show cancel confirmation modal
function showCancelModal() {
  const modal = document.getElementById('cancelModal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Hide cancel confirmation modal
function hideCancelModal() {
  const modal = document.getElementById('cancelModal');
  if (modal) {
    modal.style.display = 'none';
  }
  bookingToCancel = null;
}

// Confirm cancellation
async function confirmCancellation() {
  if (bookingToCancel === null) return;

  try {
    await apiClient.cancelBooking(bookingToCancel);
    showMessage('ยกเลิกการจองสำเร็จ', 'success');
    hideCancelModal();
    
    // Reload bookings
    await loadBookings();
  } catch (error) {
    showMessage(
      `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถยกเลิกการจองได้'}`,
      'error'
    );
    hideCancelModal();
  }
}

// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  loadBookings();

  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', handleFilterChange);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const cancelModalNo = document.getElementById('cancelModalNo');
  if (cancelModalNo) {
    cancelModalNo.addEventListener('click', hideCancelModal);
  }

  const cancelModalYes = document.getElementById('cancelModalYes');
  if (cancelModalYes) {
    cancelModalYes.addEventListener('click', confirmCancellation);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('cancelModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        hideCancelModal();
      }
    });
  }
});
