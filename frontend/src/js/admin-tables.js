// Admin Tables Management

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

let editingTableId = null;
let tableToDelete = null;

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

// Load all tables
async function loadTables() {
  try {
    setLoading(true);
    const tables = await apiClient.getTables();
    displayTables(tables);
  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลโต๊ะได้'}`, 'error');
  } finally {
    setLoading(false);
  }
}

// Display tables in table
function displayTables(tables) {
  const tableBody = document.getElementById('tablesTableBody');
  const noTablesMessage = document.getElementById('noTablesMessage');

  if (!tableBody || !noTablesMessage) return;

  tableBody.innerHTML = '';

  if (tables.length === 0) {
    noTablesMessage.classList.remove('hidden');
    return;
  }

  noTablesMessage.classList.add('hidden');

  // Sort tables by table number
  const sortedTables = [...tables].sort((a, b) => {
    return a.tableNumber.localeCompare(b.tableNumber, undefined, { numeric: true });
  });

  sortedTables.forEach(table => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${table.tableNumber}</td>
      <td>${table.capacity} ที่นั่ง</td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn btn-edit" data-table-id="${table.id}">
            แก้ไข
          </button>
          <button type="button" class="btn btn-delete" data-table-id="${table.id}" data-table-number="${table.tableNumber}">
            ลบ
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  // Add event listeners
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(button => {
    button.addEventListener('click', handleEditTable);
  });

  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(button => {
    button.addEventListener('click', handleDeleteTable);
  });
}

// Handle edit table
async function handleEditTable(event) {
  const button = event.target;
  const tableId = parseInt(button.getAttribute('data-table-id') || '0');

  if (!tableId) return;

  try {
    // Get all tables and find the one to edit
    const tables = await apiClient.getTables();
    const table = tables.find(t => t.id === tableId);

    if (!table) {
      showMessage('ไม่พบข้อมูลโต๊ะ', 'error');
      return;
    }

    // Populate form
    editingTableId = tableId;
    const tableIdInput = document.getElementById('tableId');
    const tableNumberInput = document.getElementById('tableNumber');
    const capacityInput = document.getElementById('capacity');
    const formTitle = document.getElementById('formTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (tableIdInput) tableIdInput.value = tableId.toString();
    if (tableNumberInput) tableNumberInput.value = table.tableNumber;
    if (capacityInput) capacityInput.value = table.capacity.toString();
    if (formTitle) formTitle.textContent = 'แก้ไขโต๊ะ';
    if (submitBtn) submitBtn.textContent = 'บันทึกการแก้ไข';

    // Scroll to form
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลโต๊ะได้'}`, 'error');
  }
}

// Handle delete table
function handleDeleteTable(event) {
  const button = event.target;
  const tableId = parseInt(button.getAttribute('data-table-id') || '0');
  const tableNumber = button.getAttribute('data-table-number') || '';

  if (!tableId) return;

  tableToDelete = tableId;

  // Show confirmation modal
  const modal = document.getElementById('deleteModal');
  const deleteMessage = document.getElementById('deleteMessage');

  if (modal && deleteMessage) {
    deleteMessage.textContent = `คุณแน่ใจหรือไม่ที่จะลบโต๊ะ ${tableNumber}? หากโต๊ะนี้มีการจอง active จะไม่สามารถลบได้`;
    modal.style.display = 'flex';
  }
}

// Confirm delete table
async function confirmDeleteTable() {
  if (!tableToDelete) return;

  try {
    await apiClient.deleteTable(tableToDelete);
    showMessage('ลบโต๊ะสำเร็จ', 'success');
    closeDeleteModal();
    await loadTables();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถลบโต๊ะได้';
    
    // Check if error is about active bookings
    if (errorMessage.includes('active') || errorMessage.includes('booking') || errorMessage.includes('จอง')) {
      showMessage('ไม่สามารถลบโต๊ะได้ เนื่องจากมีการจองที่ active อยู่', 'error');
    } else {
      showMessage(`เกิดข้อผิดพลาด: ${errorMessage}`, 'error');
    }
    closeDeleteModal();
  }
}

// Close delete modal
function closeDeleteModal() {
  const modal = document.getElementById('deleteModal');
  if (modal) {
    modal.style.display = 'none';
  }
  tableToDelete = null;
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const tableNumber = formData.get('tableNumber');
  const capacity = parseInt(formData.get('capacity'));

  if (!tableNumber || !capacity) {
    showMessage('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
    return;
  }

  try {
    if (editingTableId) {
      // Update existing table
      await apiClient.updateTable(editingTableId, { tableNumber, capacity });
      showMessage('แก้ไขโต๊ะสำเร็จ', 'success');
    } else {
      // Create new table
      await apiClient.createTable({ tableNumber, capacity });
      showMessage('เพิ่มโต๊ะสำเร็จ', 'success');
    }

    resetForm();
    await loadTables();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้';
    
    // Check if error is about duplicate table number
    if (errorMessage.includes('duplicate') || errorMessage.includes('already exists') || errorMessage.includes('ซ้ำ')) {
      showMessage('หมายเลขโต๊ะนี้มีอยู่ในระบบแล้ว', 'error');
    } else {
      showMessage(`เกิดข้อผิดพลาด: ${errorMessage}`, 'error');
    }
  }
}

// Reset form
function resetForm() {
  const form = document.getElementById('tableForm');
  const tableIdInput = document.getElementById('tableId');
  const formTitle = document.getElementById('formTitle');
  const submitBtn = document.getElementById('submitBtn');

  if (form) form.reset();
  if (tableIdInput) tableIdInput.value = '';
  if (formTitle) formTitle.textContent = 'เพิ่มโต๊ะใหม่';
  if (submitBtn) submitBtn.textContent = 'เพิ่มโต๊ะ';

  editingTableId = null;
}

// Handle cancel button
function handleCancel() {
  resetForm();
}

// Handle logout
function handleLogout() {
  apiClient.logout();
  window.location.href = 'login.html';
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess();
  loadTables();

  const tableForm = document.getElementById('tableForm');
  if (tableForm) {
    tableForm.addEventListener('submit', handleFormSubmit);
  }

  const cancelBtn = document.getElementById('cancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', handleCancel);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDeleteTable);
  }

  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  }

  // Close modal when clicking outside
  const modal = document.getElementById('deleteModal');
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeDeleteModal();
      }
    });
  }
});
