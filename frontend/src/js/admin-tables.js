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

// Show success dialog
function showSuccessDialog(title, message) {
  const modal = document.getElementById('successModal');
  const titleElement = document.getElementById('successTitle');
  const messageElement = document.getElementById('successMessage');
  
  if (!modal || !titleElement || !messageElement) return;

  titleElement.textContent = title;
  messageElement.textContent = message;
  modal.style.display = 'flex';
}

// Close success dialog
function closeSuccessDialog() {
  const modal = document.getElementById('successModal');
  if (modal) {
    modal.style.display = 'none';
  }
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
    const activeClass = table.isActive ? 'checked' : '';
    row.innerHTML = `
      <td>${table.tableNumber}</td>
      <td>${table.capacity} ที่นั่ง</td>
      <td>
        <label class="switch">
          <input type="checkbox" class="toggle-active" data-table-id="${table.id}" ${activeClass}>
          <span class="slider"></span>
        </label>
      </td>
      <td>
        <div class="table-actions">
          <button type="button" class="btn btn-primary" data-table-id="${table.id}" data-table-number="${table.tableNumber}" style="background: #3498db;">
            📋 ดูรายละเอียด
          </button>
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

  // Add event listeners for toggle switches
  const toggleSwitches = document.querySelectorAll('.toggle-active');
  toggleSwitches.forEach(toggle => {
    toggle.addEventListener('change', handleToggleActive);
  });

  // Add event listeners for view details buttons
  const detailButtons = document.querySelectorAll('.btn-primary[data-table-id]');
  detailButtons.forEach(button => {
    button.addEventListener('click', handleViewTableDetails);
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

// Handle view table details
async function handleViewTableDetails(event) {
  const button = event.target;
  const tableId = parseInt(button.getAttribute('data-table-id'));
  const tableNumber = button.getAttribute('data-table-number');

  if (!tableId) return;

  try {
    setLoading(true);
    const bookings = await apiClient.getTableBookings(tableId);
    showTableDetailsModal(tableNumber, bookings);
  } catch (error) {
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถโหลดข้อมูลได้'}`, 'error');
  } finally {
    setLoading(false);
  }
}

// Show table details modal
function showTableDetailsModal(tableNumber, bookings) {
  const modal = document.getElementById('tableDetailsModal');
  const detailTableNumber = document.getElementById('detailTableNumber');
  const container = document.getElementById('tableBookingsContainer');

  if (!modal || !detailTableNumber || !container) return;

  detailTableNumber.textContent = tableNumber;

  if (bookings.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 20px;">ยังไม่มีการจองสำหรับโต๊ะนี้</p>';
  } else {
    container.innerHTML = `
      <table class="tables-table booking-details-table">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>ลูกค้า</th>
            <th>เบอร์โทร</th>
            <th>จำนวนคน</th>
            <th>สถานะ</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => {
            const statusClass = booking.status === 'confirmed' ? 'status-confirmed' : 'status-cancelled';
            const statusText = booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'ยกเลิกแล้ว';
            
            // Format date as DD/MM/YYYY
            const [year, month, day] = booking.bookingDate.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            
            return `
              <tr>
                <td>${formattedDate}</td>
                <td>${booking.timeSlot}</td>
                <td>${booking.userName}</td>
                <td>${booking.userPhone || '-'}</td>
                <td style="text-align: center;">${booking.numberOfGuests} คน</td>
                <td style="text-align: center;"><span class="${statusClass}">${statusText}</span></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  modal.style.display = 'flex';
}

// Close table details modal
function closeTableDetailsModal() {
  const modal = document.getElementById('tableDetailsModal');
  if (modal) {
    modal.style.display = 'none';
  }
}

// Handle toggle active status
async function handleToggleActive(event) {
  const checkbox = event.target;
  const tableId = parseInt(checkbox.getAttribute('data-table-id'));
  const isActive = checkbox.checked;

  try {
    await apiClient.updateTable(tableId, { isActive });
    
    // Update status text
    const row = checkbox.closest('tr');
    const statusText = row.querySelector('.status-text');
    if (statusText) {
      statusText.textContent = isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน';
    }
    
    // Show success dialog
    showSuccessDialog(
      isActive ? 'เปิดใช้งานโต๊ะสำเร็จ' : 'ปิดใช้งานโต๊ะสำเร็จ',
      isActive ? 'โต๊ะนี้พร้อมให้บริการแล้ว' : 'โต๊ะนี้ถูกปิดใช้งานแล้ว'
    );
  } catch (error) {
    // Revert checkbox if error
    checkbox.checked = !isActive;
    showMessage(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถเปลี่ยนสถานะได้'}`, 'error');
  }
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
      showSuccessDialog('แก้ไขโต๊ะสำเร็จ', `โต๊ะ ${tableNumber} ถูกแก้ไขเรียบร้อยแล้ว`);
    } else {
      // Create new table
      await apiClient.createTable({ tableNumber, capacity });
      showSuccessDialog('เพิ่มโต๊ะสำเร็จ', `โต๊ะ ${tableNumber} (${capacity} ที่นั่ง) ถูกเพิ่มเข้าระบบแล้ว`);
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

  // Success modal event listeners
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', closeSuccessDialog);
  }

  const successModal = document.getElementById('successModal');
  if (successModal) {
    successModal.addEventListener('click', (event) => {
      if (event.target === successModal) {
        closeSuccessDialog();
      }
    });
  }

  // Table details modal event listeners
  const closeDetailsBtn = document.getElementById('closeDetailsBtn');
  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', closeTableDetailsModal);
  }

  const tableDetailsModal = document.getElementById('tableDetailsModal');
  if (tableDetailsModal) {
    tableDetailsModal.addEventListener('click', (event) => {
      if (event.target === tableDetailsModal) {
        closeTableDetailsModal();
      }
    });
  }
});
