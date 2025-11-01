// Login page functionality

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

// Check if user is already logged in
if (AuthService.isLoggedIn()) {
  const user = AuthService.getUserFromToken();
  if (user && user.role === 'admin') {
    window.location.href = 'admin';
  } else {
    window.location.href = 'index';
  }
}

// Get form elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');

// Handle form submission
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide previous error messages
  errorMessage.style.display = 'none';
  
  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  // Basic validation
  if (!email || !password) {
    showError('กรุณากรอกอีเมลและรหัสผ่าน');
    return;
  }
  
  // Disable submit button during request
  const submitButton = loginForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'กำลังเข้าสู่ระบบ...';
  
  try {
    // Call login API
    const response = await apiClient.login(email, password);
    
    // Login successful - check user role and redirect accordingly
    const user = AuthService.getUserFromToken();
    if (user && user.role === 'admin') {
      window.location.href = 'admin';
    } else {
      window.location.href = 'index';
    }
  } catch (error) {
    // Show error message
    const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    showError(errorMsg);
    
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'เข้าสู่ระบบ';
  }
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}
