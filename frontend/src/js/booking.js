// Booking page - Create a new booking

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

let bookingDetails = null;
let selectedTable = null;

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

// Load booking details from sessionStorage
function loadBookingDetails() {
  const storedDetails = sessionStorage.getItem('bookingDetails');
  
  if (!storedDetails) {
    showMessage('ไม่พบข้อมูลการจอง กรุณาเลือกโต๊ะใหม่', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
    return;
  }

  try {
    bookingDetails = JSON.parse(storedDetails);
    if (bookingDetails) {
      loadTableInfo();
      setMinDate();
    }
  } catch (error) {
    showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }
}

// Set minimum date to today
function setMinDate() {
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// Generate time slots and check availability
async function generateTimeSlots() {
  const timeSlotsGrid = document.getElementById('timeSlotsGrid');
  if (!timeSlotsGrid || !bookingDetails) return;

  const times = [
    '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  timeSlotsGrid.innerHTML = '<p style="text-align: center; color: #6b7280;">กำลังตรวจสอบเวลาว่าง...</p>';

  try {
    // Check availability for each time slot
    const availabilityPromises = times.map(async (time) => {
      try {
        const availableTables = await apiClient.getAvailableTables(bookingDetails.bookingDate, time);
        const isAvailable = availableTables.some(table => table.id === bookingDetails.tableId);
        return { time, isAvailable };
      } catch (error) {
        return { time, isAvailable: false };
      }
    });

    const availabilityResults = await Promise.all(availabilityPromises);
    
    timeSlotsGrid.innerHTML = '';

    availabilityResults.forEach(({ time, isAvailable }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'time-slot-btn';
      button.textContent = time;
      button.dataset.time = time;
      
      if (!isAvailable) {
        button.classList.add('disabled');
        button.disabled = true;
        button.title = 'เวลานี้ไม่ว่าง';
      } else {
        button.addEventListener('click', () => selectTimeSlot(time));
      }
      
      timeSlotsGrid.appendChild(button);
    });
  } catch (error) {
    timeSlotsGrid.innerHTML = '<p style="text-align: center; color: #e74c3c;">เกิดข้อผิดพลาดในการตรวจสอบเวลาว่าง</p>';
    console.error('Error checking availability:', error);
  }
}

// Select time slot
function selectTimeSlot(time) {
  // Remove selected class from all buttons
  const allButtons = document.querySelectorAll('.time-slot-btn');
  allButtons.forEach(btn => btn.classList.remove('selected'));
  
  // Add selected class to clicked button
  const selectedButton = document.querySelector(`[data-time="${time}"]`);
  if (selectedButton) {
    selectedButton.classList.add('selected');
  }
  
  // Set hidden input value
  const bookingTimeInput = document.getElementById('bookingTime');
  if (bookingTimeInput) {
    bookingTimeInput.value = time;
  }
}

// Load table information
async function loadTableInfo() {
  if (!bookingDetails) return;

  try {
    const tables = await apiClient.getTables();
    selectedTable = tables.find(t => t.id === bookingDetails.tableId) || null;
    
    if (!selectedTable) {
      showMessage('ไม่พบข้อมูลโต๊ะ', 'error');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      displayTableInfo();
      await generateTimeSlots();
    }
  } catch (error) {
    showMessage('เกิดข้อผิดพลาดในการโหลดข้อมูลโต๊ะ', 'error');
  }
}

// Display table info
function displayTableInfo() {
  if (!selectedTable) return;

  const summaryTable = document.getElementById('summaryTable');
  const maxCapacity = document.getElementById('maxCapacity');
  const numberOfGuestsInput = document.getElementById('numberOfGuests');

  if (summaryTable) {
    summaryTable.textContent = `โต๊ะ ${selectedTable.tableNumber} (${selectedTable.capacity} ที่นั่ง)`;
  }
  
  if (maxCapacity) {
    maxCapacity.textContent = selectedTable.capacity;
  }
  
  // Set max attribute for number of guests input
  if (numberOfGuestsInput) {
    numberOfGuestsInput.max = selectedTable.capacity;
    
    // Add validation on input
    numberOfGuestsInput.addEventListener('input', () => {
      validateGuestCount();
    });
  }
}

// Validate guest count
function validateGuestCount() {
  if (!selectedTable) return true;
  
  const numberOfGuestsInput = document.getElementById('numberOfGuests');
  const capacityWarning = document.getElementById('capacityWarning');
  const confirmBtn = document.getElementById('confirmBtn');
  
  if (!numberOfGuestsInput) return true;
  
  const numberOfGuests = parseInt(numberOfGuestsInput.value) || 0;
  const isValid = numberOfGuests > 0 && numberOfGuests <= selectedTable.capacity;
  
  if (capacityWarning) {
    capacityWarning.style.display = isValid ? 'none' : 'block';
  }
  
  if (confirmBtn) {
    confirmBtn.disabled = !isValid;
  }
  
  return isValid;
}

// Format date to Thai format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  };
  return date.toLocaleDateString('th-TH', options);
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
  const bookingFormCard = document.getElementById('bookingFormCard');
  const confirmBtn = document.getElementById('confirmBtn');

  if (loadingIndicator) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }
  if (bookingFormCard) {
    bookingFormCard.style.display = isLoading ? 'none' : 'block';
  }
  if (confirmBtn) {
    confirmBtn.disabled = isLoading;
  }
}

// Display confirmation
function displayConfirmation(reference, bookingDate, timeSlot, numberOfGuests) {
  const bookingFormCard = document.getElementById('bookingFormCard');
  const confirmationCard = document.getElementById('confirmationCard');

  if (bookingFormCard) {
    bookingFormCard.style.display = 'none';
  }
  if (confirmationCard) {
    confirmationCard.style.display = 'block';
  }

  // Fill confirmation details
  const bookingReference = document.getElementById('bookingReference');
  const confirmTable = document.getElementById('confirmTable');
  const confirmDate = document.getElementById('confirmDate');
  const confirmTime = document.getElementById('confirmTime');
  const confirmGuests = document.getElementById('confirmGuests');

  if (bookingReference) {
    bookingReference.textContent = reference;
  }
  if (confirmTable && selectedTable) {
    confirmTable.textContent = `โต๊ะ ${selectedTable.tableNumber}`;
  }
  if (confirmDate) {
    confirmDate.textContent = formatDate(bookingDate);
  }
  if (confirmTime) {
    confirmTime.textContent = timeSlot;
  }
  if (confirmGuests) {
    confirmGuests.textContent = `${numberOfGuests} คน`;
  }

  // Clear sessionStorage
  sessionStorage.removeItem('bookingDetails');
}

// Handle booking form submission
async function handleBooking(event) {
  event.preventDefault();

  if (!bookingDetails || !selectedTable) {
    showMessage('ไม่พบข้อมูลการจอง', 'error');
    return;
  }

  const form = event.target;
  const formData = new FormData(form);
  
  const bookingDate = formData.get('bookingDate');
  const bookingTime = formData.get('bookingTime');
  const numberOfGuests = parseInt(formData.get('numberOfGuests'));

  if (!bookingDate || !bookingTime || !numberOfGuests) {
    showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  // Validate guest count
  if (!validateGuestCount()) {
    showMessage(`จำนวนคนต้องไม่เกิน ${selectedTable.capacity} คน`, 'error');
    return;
  }

  const bookingRequest = {
    tableId: bookingDetails.tableId,
    bookingDate: bookingDate,
    timeSlot: bookingTime,
    numberOfGuests: numberOfGuests
  };

  console.log('Booking Request:', bookingRequest);

  try {
    setLoading(true);
    const response = await apiClient.createBooking(bookingRequest);
    displayConfirmation(response.reference, bookingDate, bookingTime, numberOfGuests);
    showMessage('จองสำเร็จ!', 'success');
  } catch (error) {
    console.error('Booking Error:', error);
    showMessage(
      `เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถจองได้'}`,
      'error'
    );
  } finally {
    setLoading(false);
  }
}

// Handle cancel button
function handleCancel() {
  sessionStorage.removeItem('bookingDetails');
  window.location.href = 'index.html';
}

// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login.html';
}

// Navigate to my bookings
function navigateToMyBookings() {
  window.location.href = 'my-bookings.html';
}

// Navigate to home
function navigateToHome() {
  window.location.href = 'index.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  loadBookingDetails();

  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleBooking);
  }

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleCancel);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const viewBookingsBtn = document.getElementById('viewBookingsBtn');
  if (viewBookingsBtn) {
    viewBookingsBtn.addEventListener('click', navigateToMyBookings);
  }

  const backHomeBtn = document.getElementById('backHomeBtn');
  if (backHomeBtn) {
    backHomeBtn.addEventListener('click', navigateToHome);
  }
});
