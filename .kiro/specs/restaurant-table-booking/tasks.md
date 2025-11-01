# แผนการพัฒนา - ระบบจองโต๊ะอาหาร

## รายการ Tasks

- [x] 1. ตั้งค่าโครงสร้างโปรเจคและ Docker
  - สร้างโครงสร้างโปรเจค .NET 8 Web API
  - สร้างโครงสร้างโฟลเดอร์ frontend สำหรับ HTML/CSS/TypeScript
  - สร้างไฟล์ Docker Compose สำหรับ PostgreSQL, API และ Web containers
  - สร้าง Dockerfiles สำหรับ API และ Web services
  - ตั้งค่า environment variables สำหรับการเชื่อมต่อฐานข้อมูลและ JWT secret
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 2. ตั้งค่าฐานข้อมูลและ Entity Framework Core
  - [x] 2.1 สร้าง database models (User, Table, Booking)
    - สร้าง User entity พร้อม username, email, password_hash, full_name, phone_number, role
    - สร้าง Table entity พร้อม table_number และ capacity
    - สร้าง Booking entity พร้อม reference, user_id, table_id, booking_date, time_slot, status
    - _Requirements: 1.2, 5.2, 8.2_
  
  - [x] 2.2 ตั้งค่า ApplicationDbContext
    - ตั้งค่า DbContext สำหรับเชื่อมต่อ PostgreSQL
    - กำหนดความสัมพันธ์ระหว่าง entities และ constraints
    - เพิ่ม indexes เพื่อประสิทธิภาพ (email, username, booking_date, reference)
    - _Requirements: 1.2, 5.2, 8.2_
  
  - [x] 2.3 สร้าง database migrations และข้อมูลเริ่มต้น
    - สร้าง initial migration สำหรับทุกตาราง
    - สร้าง DbInitializer เพื่อเพิ่มข้อมูล admin user, test customers และตัวอย่างโต๊ะ
    - _Requirements: 1.2, 8.2_

- [x] 3. พัฒนาระบบ authentication
  - [x] 3.1 สร้าง JWT helper และ authentication service
    - พัฒนา JwtHelper สำหรับสร้างและตรวจสอบ token
    - สร้าง AuthService พร้อม methods สำหรับ register และ login
    - ใช้ BCrypt สำหรับ hash passwords
    - _Requirements: 1.2, 2.2, 2.5_
  
  - [x] 3.2 สร้าง authentication DTOs และ controller
    - สร้าง RegisterDto, LoginDto และ LoginResponseDto
    - พัฒนา AuthController พร้อม endpoints สำหรับ register และ login
    - เพิ่ม validation สำหรับการลงทะเบียนและ login
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_
  
  - [x] 3.3 ตั้งค่า JWT authentication middleware
    - เพิ่ม JWT authentication ใน Program.cs
    - ตั้งค่าการตรวจสอบ JWT bearer token
    - เพิ่ม authorization policies สำหรับ admin role
    - _Requirements: 2.5_

- [x] 4. พัฒนาระบบจัดการโต๊ะ
  - [x] 4.1 สร้าง table service และ DTOs
    - สร้าง TableDto สำหรับ API responses
    - พัฒนา TableService พร้อม CRUD operations
    - เพิ่มตรรกะตรวจสอบการจองที่ active ก่อนลบโต๊ะ
    - _Requirements: 8.2, 8.3, 8.4_
  
  - [x] 4.2 สร้าง TablesController พร้อม endpoints
    - พัฒนา GET /api/tables (public)
    - พัฒนา GET /api/tables/available พร้อม query parameters date และ timeSlot (public)
    - พัฒนา POST /api/tables [Authorize(Roles = "admin")]
    - พัฒนา PUT /api/tables/{id} [Authorize(Roles = "admin")]
    - พัฒนา DELETE /api/tables/{id} [Authorize(Roles = "admin")]
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 5. พัฒนาระบบจัดการการจอง
  - [x] 5.1 สร้าง booking service และ DTOs
    - สร้าง BookingRequestDto และ BookingResponseDto
    - พัฒนา BookingService พร้อม methods สำหรับ create, get และ cancel
    - เพิ่มตรรกะสร้าง booking reference (BK{YYYYMMDD}{XXXX})
    - เพิ่มตรรกะตรวจสอบว่าโต๊ะว่างหรือไม่
    - _Requirements: 5.2, 5.4, 5.5_
  
  - [x] 5.2 สร้าง BookingsController พร้อม endpoints
    - พัฒนา POST /api/bookings [Authorize] - สร้างการจองสำหรับผู้ใช้ที่ login
    - พัฒนา GET /api/bookings/my [Authorize] - ดึงการจองของผู้ใช้
    - พัฒนา DELETE /api/bookings/{id} [Authorize] - ยกเลิกการจองของตัวเอง
    - พัฒนา GET /api/bookings [Authorize(Roles = "admin")] - ดึงการจองทั้งหมดพร้อม filters
    - เพิ่ม validation เพื่อให้แน่ใจว่าผู้ใช้สามารถยกเลิกเฉพาะการจองของตัวเองเท่านั้น
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 6. ตั้งค่า Swagger UI
  - เพิ่มการตั้งค่า Swagger/OpenAPI ใน Program.cs
  - ตั้งค่า JWT bearer authentication ใน Swagger
  - เพิ่ม XML documentation comments ให้ controllers
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [x] 7. Build และทดสอบ backend API
  - Build โปรเจค .NET และตรวจสอบว่าไม่มี compilation errors
  - ทดสอบว่า Docker container build สำเร็จ
  - ตรวจสอบว่า database migrations ทำงานถูกต้อง
  - ทดสอบ API endpoints ทั้งหมดผ่าน Swagger UI
  - _Requirements: 10.2, 10.3, 11.3_

- [x] 8. พัฒนาหน้า authentication ของ frontend
  - [x] 8.1 สร้าง TypeScript models และ API client
    - สร้าง interfaces สำหรับ User, RegisterRequest, LoginResponse, Table, Booking
    - พัฒนา ApiClient class พร้อม authentication methods
    - พัฒนา AuthService สำหรับจัดการ token
    - _Requirements: 1.1, 2.1, 3.1_
  
  - [x] 8.2 สร้างหน้า login
    - สร้าง login.html พร้อมฟอร์ม email และ password
    - เพิ่ม CSS styling สำหรับฟอร์ม login
    - พัฒนา login.ts เพื่อจัดการ form submission และเรียก API
    - เก็บ JWT token ใน localStorage เมื่อ login สำเร็จ
    - Redirect ไปหน้า home หลัง login
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 8.3 สร้างหน้า register
    - สร้าง register.html พร้อมฟอร์มลงทะเบียน (username, email, password, full name, phone)
    - เพิ่ม CSS styling สำหรับฟอร์มลงทะเบียน
    - พัฒนา register.ts เพื่อจัดการ form submission และ validation
    - แสดงข้อความสำเร็จและ redirect ไปหน้า login
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 9. พัฒนาหน้าสำหรับลูกค้า
  - [x] 9.1 สร้างหน้า home พร้อมค้นหาโต๊ะ
    - สร้าง index.html พร้อมฟอร์มเลือกวันที่และช่วงเวลา
    - เพิ่ม navigation bar พร้อมชื่อผู้ใช้และปุ่ม logout
    - พัฒนา index.ts เพื่อดึงและแสดงโต๊ะที่ว่าง
    - เพิ่มการตรวจสอบ authentication และ redirect ไป login ถ้ายังไม่ได้ login
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 9.2 สร้างหน้าจองโต๊ะ
    - สร้าง booking.html พร้อมฟอร์มจอง (จำนวนคน, วันที่, เวลา, เลือกโต๊ะ)
    - พัฒนา booking.ts เพื่อสร้างการจองผ่าน API
    - แสดงการยืนยันการจองพร้อมเลข reference
    - จัดการ validation errors และแสดงข้อความ
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 9.3 สร้างหน้าการจองของฉัน
    - สร้าง my-bookings.html เพื่อแสดงประวัติการจองของผู้ใช้
    - เพิ่มตัวเลือก filter ตามสถานะ (upcoming, past, cancelled)
    - พัฒนา my-bookings.ts เพื่อดึงและแสดงการจอง
    - เพิ่มฟังก์ชันยกเลิกการจองพร้อมการยืนยัน
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

- [x] 10. พัฒนาหน้าสำหรับ admin
  - [x] 10.1 สร้าง admin dashboard
    - สร้าง admin.html พร้อม navigation ไปยังหน้าจัดการโต๊ะและการจอง
    - เพิ่มการตรวจสอบ role เพื่อให้แน่ใจว่ามีเฉพาะ admin เท่านั้นที่เข้าถึงได้
    - แสดงสถิติการจองของวันนี้
    - _Requirements: 8.1, 9.1_
  
  - [x] 10.2 สร้างหน้าจัดการโต๊ะ
    - สร้าง admin-tables.html พร้อมรายการโต๊ะและฟอร์ม CRUD
    - พัฒนา admin-tables.ts เพื่อจัดการโต๊ะผ่าน API
    - เพิ่มฟังก์ชันเพิ่ม, แก้ไข และลบโต๊ะ
    - จัดการ errors (เช่น ไม่สามารถลบโต๊ะที่มีการจอง active)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 10.3 สร้างหน้าจัดการการจอง
    - สร้าง admin-bookings.html เพื่อแสดงการจองทั้งหมดจากทุกคน
    - เพิ่ม filters สำหรับวันที่และสถานะ
    - พัฒนา admin-bookings.ts เพื่อดึงและแสดงการจองทั้งหมด
    - แสดงข้อมูลลูกค้าสำหรับแต่ละการจอง
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. เพิ่ม CSS styling แบบ global
  - สร้าง main.css พร้อม styling ที่สอดคล้องกันสำหรับทุกหน้า
  - เพิ่ม responsive design สำหรับ mobile และ desktop
  - จัด style ให้ forms, tables, buttons และ navigation
  - เพิ่ม styling สำหรับข้อความ error และ success
  - _Requirements: All UI requirements_

- [x] 12. ตั้งค่า frontend Docker container
  - สร้าง Dockerfile สำหรับ frontend ด้วย Nginx
  - ตั้งค่า Nginx เพื่อ serve static files
  - เพิ่มขั้นตอน TypeScript compilation
  - ตั้งค่า Nginx สำหรับ SPA routing
  - _Requirements: 10.1, 10.2, 10.4_

- [x] 13. Integration และทดสอบทั้งระบบ
  - รัน Docker Compose stack ทั้งหมด
  - ทดสอบ user flows ทั้งหมด (register, login, จองโต๊ะ, ดูการจอง, ยกเลิก)
  - ทดสอบ admin flows (จัดการโต๊ะ, ดูการจองทั้งหมด)
  - ตรวจสอบว่า API endpoints ทั้งหมดทำงานถูกต้อง
  - ทดสอบ error handling และ validation
  - _Requirements: 10.2, 10.3, 10.4_

- [x] 14. สร้างเอกสาร README
  - เขียนคำแนะนำการตั้งค่าโปรเจค
  - เพิ่มคำสั่ง Docker Compose
  - เขียนเอกสาร API endpoints
  - ระบุ admin credentials เริ่มต้น
  - แนบภาพหน้าจอสำคัญๆ
  - _Requirements: All requirements_
