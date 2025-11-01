# Requirements Document

## Introduction

ระบบจองโต๊ะอาหารออนไลน์ (Restaurant Table Booking System) เป็นระบบที่ช่วยให้ลูกค้าสามารถจองโต๊ะอาหารล่วงหน้าได้ และช่วยให้เจ้าของร้านอาหารสามารถจัดการการจองและโต๊ะได้อย่างมีประสิทธิภาพ ระบบนี้ประกอบด้วย Frontend (HTML/CSS/TypeScript), Backend (C#/.NET), ฐานข้อมูล (PostgreSQL), และ Docker สำหรับการ deployment

## Glossary

- **Booking System**: ระบบจองโต๊ะอาหารที่พัฒนาขึ้น
- **Customer**: ผู้ใช้งานที่ลงทะเบียนและต้องการจองโต๊ะอาหาร
- **Admin**: ผู้ดูแลระบบที่จัดการข้อมูลร้านอาหารและการจอง
- **User**: บัญชีผู้ใช้ในระบบที่มีข้อมูล username และ password
- **Table**: โต๊ะอาหารในร้านที่สามารถจองได้
- **Booking**: การจองโต๊ะอาหารที่สร้างโดย Customer
- **Time Slot**: ช่วงเวลาที่สามารถจองได้
- **Database**: ฐานข้อมูล PostgreSQL ที่เก็บข้อมูลระบบ
- **API**: RESTful API ที่พัฒนาด้วย C#/.NET
- **Web Interface**: หน้าเว็บที่พัฒนาด้วย HTML/CSS/TypeScript
- **JWT Token**: JSON Web Token ที่ใช้สำหรับ authentication

## Requirements

### Requirement 1

**User Story:** As a new user, I want to register an account with my email and password, so that I can access the booking system

#### Acceptance Criteria

1. THE Web Interface SHALL provide a registration form with fields for username, email, password, full name, and phone number
2. WHEN the user submits the registration form with valid information, THE Booking System SHALL create a new user account in the Database
3. WHEN the user submits the registration form with an existing email, THE Booking System SHALL display an error message indicating the email is already registered
4. THE Booking System SHALL validate that the password meets minimum security requirements of at least 6 characters
5. WHEN registration is successful, THE Booking System SHALL redirect the user to the login page with a success message

### Requirement 2

**User Story:** As a registered user, I want to login with my credentials, so that I can access my bookings and make new reservations

#### Acceptance Criteria

1. THE Web Interface SHALL provide a login form with fields for email and password
2. WHEN the user submits valid credentials, THE Booking System SHALL authenticate the user and generate a JWT token
3. WHEN the user submits invalid credentials, THE Booking System SHALL display an error message
4. WHEN authentication is successful, THE Booking System SHALL store the JWT token and redirect the user to the home page
5. THE API SHALL validate the JWT token for all protected endpoints

### Requirement 3

**User Story:** As a logged-in user, I want to logout from the system, so that I can secure my account

#### Acceptance Criteria

1. THE Web Interface SHALL provide a logout button when the user is authenticated
2. WHEN the user clicks logout, THE Booking System SHALL clear the stored JWT token
3. WHEN the user logs out, THE Booking System SHALL redirect to the login page

### Requirement 4

**User Story:** As a Customer, I want to view available tables for a specific date and time, so that I can choose a suitable table for my reservation

#### Acceptance Criteria

1. WHEN the Customer selects a date and time slot, THE Booking System SHALL display all available tables with their capacity
2. THE Web Interface SHALL show table details including table number, seating capacity, and availability status
3. WHEN no tables are available for the selected time, THE Booking System SHALL display a message indicating no availability
4. THE Booking System SHALL retrieve table availability data from the Database within 2 seconds

### Requirement 5

**User Story:** As a logged-in Customer, I want to create a booking by selecting a table, so that I can reserve a table for dining

#### Acceptance Criteria

1. THE Web Interface SHALL provide a booking form with fields for number of guests, date, and time slot
2. WHEN the Customer submits the booking form with valid information, THE Booking System SHALL create a new booking record linked to the user account in the Database
3. WHEN the Customer submits the booking form with invalid information, THE Booking System SHALL display validation error messages
4. WHEN a booking is successfully created, THE Booking System SHALL display a confirmation message with booking details
5. THE API SHALL validate that the selected table is still available before creating the booking
6. THE API SHALL require a valid JWT token to create a booking

### Requirement 6

**User Story:** As a logged-in Customer, I want to view my booking history, so that I can see all my past and upcoming reservations

#### Acceptance Criteria

1. THE Web Interface SHALL display a list of all bookings for the logged-in user
2. THE Booking System SHALL show booking information including booking reference, table number, date, time slot, number of guests, and status
3. THE API SHALL retrieve only bookings that belong to the authenticated user
4. THE Web Interface SHALL allow filtering bookings by status (upcoming, past, cancelled)

### Requirement 7

**User Story:** As a logged-in Customer, I want to cancel my booking, so that I can free up the table if my plans change

#### Acceptance Criteria

1. WHEN the Customer requests to cancel their own booking, THE Booking System SHALL update the booking status to cancelled
2. WHEN a booking is cancelled, THE Booking System SHALL make the table available for other customers
3. THE Booking System SHALL display a cancellation confirmation message after successful cancellation
4. THE API SHALL verify that the booking belongs to the authenticated user before allowing cancellation

### Requirement 8

**User Story:** As an Admin, I want to manage table information, so that I can add, update, or remove tables in the system

#### Acceptance Criteria

1. THE Web Interface SHALL provide an admin panel for table management accessible only to admin users
2. WHEN the Admin adds a new table, THE Booking System SHALL store the table information including table number and seating capacity in the Database
3. WHEN the Admin updates table information, THE Booking System SHALL update the corresponding record in the Database
4. WHEN the Admin deletes a table, THE Booking System SHALL remove the table from the Database if it has no active bookings
5. THE API SHALL verify that the user has admin role before allowing table management operations

### Requirement 9

**User Story:** As an Admin, I want to view all bookings from all customers, so that I can manage reservations and prepare for customers

#### Acceptance Criteria

1. THE Web Interface SHALL display a list of all bookings with filtering options by date and status
2. THE Booking System SHALL retrieve booking data from the Database and display customer name, table number, date, time slot, and booking status
3. WHEN the Admin selects a specific date, THE Booking System SHALL show only bookings for that date
4. THE API SHALL provide endpoints for retrieving booking lists with pagination support
5. THE API SHALL verify that the user has admin role before allowing access to all bookings

### Requirement 10

**User Story:** As a Developer, I want the system to run in Docker containers, so that deployment and development environments are consistent

#### Acceptance Criteria

1. THE Booking System SHALL provide Docker configuration files for all components
2. WHEN Docker Compose is executed, THE Booking System SHALL start the Database, API, and Web Interface containers
3. THE API container SHALL connect to the Database container successfully
4. THE Web Interface SHALL be accessible through a web browser when containers are running

### Requirement 11

**User Story:** As a Developer, I want API documentation through Swagger UI, so that I can understand and test API endpoints easily

#### Acceptance Criteria

1. THE API SHALL expose Swagger UI at a designated endpoint
2. THE Swagger UI SHALL document all API endpoints with request and response schemas
3. WHEN a Developer accesses Swagger UI, THE Booking System SHALL display interactive API documentation
4. THE Swagger UI SHALL allow testing of API endpoints directly from the browser
