// Admin Bookings Management

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

// Check authentication and admin role
function checkAdminAccess() {
  if (!AuthService.isLoggedIn()) {
    window.location.href = 'login';
    return;
  }

  if (!AuthService.isAdmin()) {
    alert('คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
    window.location.href = 'index';
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

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format datetime for display
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Store all bookings for filtering
let allBookings = [];

// Load bookings with filters
async function loadBookings(date, status, name) {
  try {
    setLoading(true);
    const bookings = await apiClient.getAllBookings(date, status);
    allBookings = bookings;
    
    // Filter by name if provided
    let filteredBookings = bookings;
    if (name && name.trim()) {
      const searchTerm = name.trim().toLowerCase();
      filteredBookings = bookings.filter(booking => 
        booking.userName.toLowerCase().includes(searchTerm)
      );
    }
    
    displayBookings(filteredBookings);
  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลการจองได้'}`, 'error');
  } finally {
    setLoading(false);
  }
}

// Display bookings
function displayBookings(bookings) {
  const bookingsList = document.getElementById('bookingsList');
  const noBookingsMessage = document.getElementById('noBookingsMessage');

  if (!bookingsList || !noBookingsMessage) return;

  bookingsList.innerHTML = '';

  if (bookings.length === 0) {
    noBookingsMessage.classList.remove('hidden');
    return;
  }

  noBookingsMessage.classList.add('hidden');

  // Sort bookings by date and time (newest first)
  const sortedBookings = [...bookings].sort((a, b) => {
    const dateCompare = b.bookingDate.localeCompare(a.bookingDate);
    if (dateCompare !== 0) return dateCompare;
    return b.timeSlot.localeCompare(a.timeSlot);
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
          <label>วันที่จอง</label>
          <span>${formatDate(booking.bookingDate)}</span>
        </div>
        <div class="booking-field">
          <label>เวลา</label>
          <span>${booking.timeSlot}</span>
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
          <label>สถานะ</label>
          <span class="booking-status ${statusClass}">${statusText}</span>
        </div>
      </div>
      <div class="booking-actions">
        <button type="button" class="btn btn-primary btn-detail" data-booking-id="${booking.id}">
          ดูรายละเอียด
        </button>
      </div>
    `;

    bookingsList.appendChild(bookingItem);
  });

  // Add event listeners to detail buttons
  const detailButtons = document.querySelectorAll('.btn-detail');
  detailButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const bookingId = parseInt(e.target.getAttribute('data-booking-id'));
      const booking = sortedBookings.find(b => b.id === bookingId);
      if (booking) {
        showBookingDetail(booking);
      }
    });
  });
}

// Show booking detail modal
function showBookingDetail(booking) {
  const modal = document.getElementById('detailModal');
  const content = document.getElementById('bookingDetailContent');
  
  if (!modal || !content) return;

  const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
  const statusText = booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว';

  content.innerHTML = `
    <div class="detail-item">
      <span class="detail-label">เลขที่การจอง:</span>
      <span class="detail-value reference">${booking.reference}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">ชื่อลูกค้า:</span>
      <span class="detail-value">${booking.userName}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">เบอร์โทร:</span>
      <span class="detail-value">${booking.userPhone || '-'}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">วันที่จอง:</span>
      <span class="detail-value">${formatDate(booking.bookingDate)}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">เวลา:</span>
      <span class="detail-value">${booking.timeSlot}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">โต๊ะ:</span>
      <span class="detail-value">${booking.tableNumber}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">จำนวนคน:</span>
      <span class="detail-value">${booking.numberOfGuests} คน</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">สถานะ:</span>
      <span class="booking-status ${statusClass}">${statusText}</span>
    </div>
    <div class="detail-item">
      <span class="detail-label">วันที่สร้างการจอง:</span>
      <span class="detail-value">${formatDateTime(booking.createdAt)}</span>
    </div>
  `;

  modal.style.display = 'flex';
}

// Close modal
function closeModal() {
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Handle filter form submission
async function handleFilterSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const name = formData.get('filterName') || undefined;
  const date = formData.get('filterDate') || undefined;
  const status = formData.get('filterStatus') || undefined;

  await loadBookings(date, status, name);
}

// Handle reset filters
async function handleResetFilters() {
  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.reset();
  }

  await loadBookings();
}

// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  loadBookings();

  const filterForm = document.getElementById('filterForm');
  if (filterForm) {
    filterForm.addEventListener('submit', handleFilterSubmit);
  }

  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', handleResetFilters);
  }

  const closeDetailBtn = document.getElementById('closeDetailBtn');
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('detailModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
