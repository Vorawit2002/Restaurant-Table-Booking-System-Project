// Register page functionality

import '../css/main.css';
import { ApiClient } from './api-client.js';
import { AuthService } from './auth-service.js';

const apiClient = new ApiClient();

// Check if user is already logged in
if (AuthService.isLoggedIn()) {
  const user = AuthService.getUserFromToken();
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'index.html';
  }
}

// Get form elements
const registerForm = document.getElementById('registerForm');
const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const fullNameInput = document.getElementById('fullName');
const phoneNumberInput = document.getElementById('phoneNumber');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

// Handle form submission
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Hide previous messages
  errorMessage.style.display = 'none';
  successMessage.style.display = 'none';
  
  // Get form values
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const fullName = fullNameInput.value.trim();
  const phoneNumber = phoneNumberInput.value.trim();
  
  // Validate form
  const validationError = validateForm(username, email, password, fullName, phoneNumber);
  if (validationError) {
    showError(validationError);
    return;
  }
  
  // Disable submit button during request
  const submitButton = registerForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'กำลังลงทะเบียน...';
  
  try {
    // Prepare registration data
    const registerData = {
      username,
      email,
      password,
      fullName,
      phoneNumber
    };
    
    // Call register API
    await apiClient.register(registerData);
    
    // Registration successful
    showSuccess('ลงทะเบียนสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...');
    
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
    
  } catch (error) {
    // Show error message
    const errorMsg = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลงทะเบียน';
    showError(errorMsg);
    
    // Re-enable submit button
    submitButton.disabled = false;
    submitButton.textContent = 'ลงทะเบียน';
  }
});

function validateForm(username, email, password, fullName, phoneNumber) {
  // Username validation
  if (username.length < 3 || username.length > 50) {
    return 'ชื่อผู้ใช้ต้องมีความยาว 3-50 ตัวอักษร';
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษร ตัวเลข และ _ เท่านั้น';
  }
  
  // Email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'กรุณากรอกอีเมลที่ถูกต้อง';
  }
  
  // Password validation
  if (password.length < 6) {
    return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
  }
  
  // Full name validation
  if (fullName.length < 2 || fullName.length > 100) {
    return 'ชื่อ-นามสกุลต้องมีความยาว 2-100 ตัวอักษร';
  }
  
  // Phone number validation
  if (!/^[0-9]{10}$/.test(phoneNumber)) {
    return 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก';
  }
  
  return null;
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  successMessage.style.display = 'none';
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.style.display = 'block';
  errorMessage.style.display = 'none';
}
