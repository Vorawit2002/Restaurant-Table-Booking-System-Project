// Home page - Search for suitable tables

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

// Check authentication immediately
if (!AuthService.isLoggedIn()) {
  window.location.href = 'login';
}

// Check authentication on page load
function checkAuthentication() {
  if (!AuthService.isLoggedIn()) {
    window.location.href = 'login';
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

// Set minimum date to today
function setMinDate() {
  const dateInput = document.getElementById('bookingDate');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    dateInput.min = todayString;
    dateInput.value = todayString;
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
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }
}

// Find best suitable tables
function findSuitableTables(allTables, numberOfGuests) {
  // Filter tables that can accommodate the number of guests but not more than 2x
  const maxCapacity = numberOfGuests * 2;
  const suitableTables = allTables.filter(table => 
    table.capacity >= numberOfGuests && table.capacity <= maxCapacity
  );
  
  if (suitableTables.length === 0) {
    return [];
  }
  
  // Sort by capacity (smallest first)
  suitableTables.sort((a, b) => a.capacity - b.capacity);
  
  // Find tables with exact capacity match
  const exactMatchTables = suitableTables.filter(table => table.capacity === numberOfGuests);
  
  // If we have exact match tables, return only those
  if (exactMatchTables.length > 0) {
    return exactMatchTables;
  }
  
  // If no exact match, find the next smallest size available
  const smallestAvailableCapacity = suitableTables[0].capacity;
  const nextSizeTables = suitableTables.filter(table => table.capacity === smallestAvailableCapacity);
  
  return nextSizeTables;
}

// Display suitable tables
function displayTables(tables, numberOfGuests, bookingDate) {
  const tablesList = document.getElementById('tablesList');
  const tablesContainer = document.getElementById('tablesContainer');
  const noResultsContainer = document.getElementById('noResultsContainer');

  if (!tablesList || !tablesContainer || !noResultsContainer) return;

  tablesList.innerHTML = '';

  if (tables.length === 0) {
    tablesContainer.style.display = 'none';
    noResultsContainer.style.display = 'block';
    return;
  }

  tablesContainer.style.display = 'block';
  noResultsContainer.style.display = 'none';

  tables.forEach((table, index) => {
    const tableCard = document.createElement('div');
    tableCard.className = 'table-card';
    
    tableCard.innerHTML = `
      <div class="table-icon">🪑</div>
      <h3>โต๊ะ ${table.tableNumber}</h3>
      <p class="table-capacity">รองรับ ${table.capacity} ที่นั่ง</p>
      <button class="btn btn-primary btn-book" 
              data-table-id="${table.id}" 
              data-table-capacity="${table.capacity}"
              data-booking-date="${bookingDate}"
              data-number-of-guests="${numberOfGuests}">
        เลือกโต๊ะนี้
      </button>
    `;
    tablesList.appendChild(tableCard);
  });

  // Add event listeners to booking buttons
  const bookButtons = document.querySelectorAll('.btn-book');
  bookButtons.forEach(button => {
    button.addEventListener('click', handleSelectTable);
  });
}

// Handle table selection
function handleSelectTable(event) {
  const button = event.target;
  const tableId = button.getAttribute('data-table-id');
  const tableCapacity = button.getAttribute('data-table-capacity');
  const bookingDate = button.getAttribute('data-booking-date');
  const numberOfGuests = button.getAttribute('data-number-of-guests');

  if (!tableId) return;

  // Store table selection and redirect to booking page (without time)
  const bookingDetails = {
    tableId: parseInt(tableId),
    tableCapacity: parseInt(tableCapacity),
    bookingDate: bookingDate,
    numberOfGuests: parseInt(numberOfGuests)
  };

  sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
  window.location.href = 'booking';
}

// Handle search form submission
async function handleSearch(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  
  const numberOfGuests = parseInt(formData.get('numberOfGuests'));
  const bookingDate = formData.get('bookingDate');

  if (!numberOfGuests || !bookingDate) {
    showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  try {
    setLoading(true);
    
    // Get all active tables
    const allTables = await apiClient.getTables();
    const activeTables = allTables.filter(table => table.isActive);
    
    // Find suitable tables based on number of guests
    const suitableTables = findSuitableTables(activeTables, numberOfGuests);
    
    if (suitableTables.length === 0) {
      showMessage(`ไม่พบโต๊ะที่รองรับ ${numberOfGuests} คน`, 'error');
    }
    
    displayTables(suitableTables, numberOfGuests, bookingDate);
  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถค้นหาโต๊ะได้'}`, 'error');
  } finally {
    setLoading(false);
  }
}



// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
  setMinDate();

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
});
