# Design Document - Restaurant Table Booking System

## Overview

ระบบจองโต๊ะอาหารเป็น web application แบบ full-stack ที่ประกอบด้วย:
- **Frontend**: Single Page Application (SPA) ใช้ HTML/CSS/TypeScript
- **Backend**: RESTful API ใช้ C# และ .NET 8 พร้อม JWT Authentication
- **Database**: PostgreSQL 15
- **Containerization**: Docker และ Docker Compose
- **API Documentation**: Swagger UI

ระบบนี้ออกแบบให้เรียบง่าย เหมาะสำหรับโปรเจคจบการศึกษา โดยมีตารางฐานข้อมูลเพียง 3 ตารางหลัก (Users, Tables, Bookings)

## Architecture

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP/HTTPS
         ▼
┌─────────────────┐
│    Frontend     │
│  (TypeScript)   │
│   Static Files  │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│   Backend API   │
│   (.NET 8)      │
│   + Swagger UI  │
└────────┬────────┘
         │ SQL
         ▼
┌─────────────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘
```

### Deployment Architecture (Docker)

```
┌──────────────────────────────────────┐
│         Docker Compose               │
│                                      │
│  ┌────────────┐  ┌────────────┐    │
│  │  Frontend  │  │  Backend   │    │
│  │ Container  │  │ Container  │    │
│  │  (Nginx)   │  │  (.NET)    │    │
│  │  Port 80   │  │  Port 5000 │    │
│  └────────────┘  └──────┬─────┘    │
│                         │           │
│                  ┌──────▼─────┐    │
│                  │ PostgreSQL │    │
│                  │ Container  │    │
│                  │ Port 5432  │    │
│                  └────────────┘    │
└──────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Authentication Pages
- **Login Page** (`login.html`)
  - ฟอร์ม login (email, password)
  - ลิงก์ไปหน้า register
  - แสดง error messages
  
- **Register Page** (`register.html`)
  - ฟอร์ม register (username, email, password, full name, phone number)
  - ลิงก์ไปหน้า login
  - แสดง validation errors

#### 2. Customer Interface (ต้อง login)
- **Home Page** (`index.html`)
  - แสดงข้อมูลร้านอาหาร
  - ฟอร์มค้นหาโต๊ะว่าง (เลือกวันที่และเวลา)
  - แสดงชื่อผู้ใช้และปุ่ม logout
  
- **Booking Page** (`booking.html`)
  - แสดงโต๊ะที่ว่าง
  - ฟอร์มจองโต๊ะ (จำนวนคน, วันที่, เวลา)
  - แสดงผลการจองสำเร็จ
  
- **My Bookings Page** (`my-bookings.html`)
  - แสดงรายการจองทั้งหมดของผู้ใช้
  - ฟิลเตอร์ตามสถานะ (upcoming, past, cancelled)
  - ปุ่มยกเลิกการจอง

#### 3. Admin Interface (ต้อง login ด้วย admin role)
- **Admin Dashboard** (`admin.html`)
  - แสดงสถิติการจองวันนี้
  - ลิงก์ไปยังหน้าจัดการต่างๆ
  - แสดงชื่อ admin และปุ่ม logout
  
- **Table Management** (`admin-tables.html`)
  - ตารางแสดงรายการโต๊ะทั้งหมด
  - ฟอร์มเพิ่ม/แก้ไขโต๊ะ
  - ปุ่มลบโต๊ะ
  
- **Booking Management** (`admin-bookings.html`)
  - ตารางแสดงรายการจองทั้งหมดจากทุกคน
  - ฟิลเตอร์ตามวันที่และสถานะ
  - ดูรายละเอียดการจอง

#### 4. TypeScript Modules

```typescript
// api-client.ts - HTTP client สำหรับเรียก API
class ApiClient {
  private token: string | null
  
  // Authentication
  async register(data: RegisterRequest): Promise<void>
  async login(email: string, password: string): Promise<LoginResponse>
  logout(): void
  
  // Tables
  async getTables(): Promise<Table[]>
  async getAvailableTables(date: string, timeSlot: string): Promise<Table[]>
  async createTable(table: TableRequest): Promise<Table>
  async updateTable(id: number, table: TableRequest): Promise<void>
  async deleteTable(id: number): Promise<void>
  
  // Bookings
  async createBooking(booking: BookingRequest): Promise<BookingResponse>
  async getMyBookings(): Promise<Booking[]>
  async cancelBooking(id: number): Promise<void>
  async getAllBookings(date?: string, status?: string): Promise<Booking[]>
  
  // Helper methods
  setToken(token: string): void
  getToken(): string | null
  isAuthenticated(): boolean
}

// auth.ts - Authentication helper
class AuthService {
  static saveToken(token: string): void
  static getToken(): string | null
  static removeToken(): void
  static isLoggedIn(): boolean
  static getUserFromToken(): User | null
  static isAdmin(): boolean
}

// models.ts - Type definitions
interface User {
  id: number
  username: string
  email: string
  fullName: string
  phoneNumber: string
  role: 'customer' | 'admin'
}

interface RegisterRequest {
  username: string
  email: string
  password: string
  fullName: string
  phoneNumber: string
}

interface LoginResponse {
  token: string
  user: User
}

interface Table {
  id: number
  tableNumber: string
  capacity: number
}

interface Booking {
  id: number
  reference: string
  userId: number
  userName: string
  numberOfGuests: number
  tableId: number
  tableNumber: string
  bookingDate: string
  timeSlot: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
}

interface BookingRequest {
  numberOfGuests: number
  tableId: number
  bookingDate: string
  timeSlot: string
}

interface BookingResponse {
  reference: string
  message: string
}

interface TableRequest {
  tableNumber: string
  capacity: number
}
```

### Backend API Endpoints

#### Authentication API
```
POST   /api/auth/register             - ลงทะเบียนผู้ใช้ใหม่
POST   /api/auth/login                - Login และรับ JWT token
```

#### Tables API
```
GET    /api/tables                    - ดึงรายการโต๊ะทั้งหมด (Public)
GET    /api/tables/available          - ดึงโต๊ะว่าง (Public, query: date, timeSlot)
POST   /api/tables                    - เพิ่มโต๊ะใหม่ [Requires: Admin]
PUT    /api/tables/{id}               - แก้ไขโต๊ะ [Requires: Admin]
DELETE /api/tables/{id}               - ลบโต๊ะ [Requires: Admin]
```

#### Bookings API
```
GET    /api/bookings/my               - ดึงรายการจองของผู้ใช้ [Requires: Auth]
POST   /api/bookings                  - สร้างการจองใหม่ [Requires: Auth]
DELETE /api/bookings/{id}             - ยกเลิกการจอง [Requires: Auth, Own booking]
GET    /api/bookings                  - ดึงรายการจองทั้งหมด [Requires: Admin, query: date, status]
```

#### Swagger UI
```
GET    /swagger                       - Swagger UI interface
GET    /swagger/v1/swagger.json       - OpenAPI specification
```

### Backend Project Structure

```
RestaurantBooking.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── TablesController.cs
│   └── BookingsController.cs
├── Models/
│   ├── User.cs
│   ├── Table.cs
│   ├── Booking.cs
│   └── DTOs/
│       ├── RegisterDto.cs
│       ├── LoginDto.cs
│       ├── LoginResponseDto.cs
│       ├── BookingRequestDto.cs
│       ├── BookingResponseDto.cs
│       └── TableDto.cs
├── Data/
│   ├── ApplicationDbContext.cs
│   └── DbInitializer.cs
├── Services/
│   ├── IAuthService.cs
│   ├── AuthService.cs
│   ├── ITableService.cs
│   ├── TableService.cs
│   ├── IBookingService.cs
│   └── BookingService.cs
├── Middleware/
│   └── JwtMiddleware.cs
├── Helpers/
│   └── JwtHelper.cs
├── Program.cs
└── appsettings.json
```

## Data Models

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (role IN ('customer', 'admin'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### Tables Table
```sql
CREATE TABLE tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(10) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Bookings Table
```sql
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    reference VARCHAR(20) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
    table_id INTEGER NOT NULL REFERENCES tables(id),
    booking_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('confirmed', 'cancelled'))
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_reference ON bookings(reference);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### Time Slots

ระบบจะใช้ time slots แบบ hard-coded ดังนี้:
- 11:00-13:00 (Lunch)
- 13:00-15:00 (Lunch)
- 17:00-19:00 (Dinner)
- 19:00-21:00 (Dinner)
- 21:00-23:00 (Dinner)

### Booking Reference Generation

Reference จะถูกสร้างแบบ random ด้วยรูปแบบ: `BK{YYYYMMDD}{XXXX}`
- YYYYMMDD = วันที่จอง
- XXXX = random 4 ตัวอักษร/ตัวเลข

ตัวอย่าง: `BK20241101A3F2`

### Entity Relationships

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    Users    │         │   Bookings   │         │   Tables    │
├─────────────┤         ├──────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ id (PK)      │────────►│ id (PK)     │
│ username    │         │ reference    │         │ table_number│
│ email       │         │ user_id (FK) │         │ capacity    │
│ password_   │         │ table_id (FK)│         │ created_at  │
│   hash      │         │ number_of_   │         └─────────────┘
│ full_name   │         │   guests     │
│ phone_number│         │ booking_date │
│ role        │         │ time_slot    │
│ created_at  │         │ status       │
└─────────────┘         │ created_at   │
                        └──────────────┘
```

## Error Handling

### Frontend Error Handling
- แสดง error messages ในรูปแบบ alert หรือ notification
- Validation ฝั่ง client ก่อนส่ง request
- Handle network errors และแสดงข้อความที่เหมาะสม

### Backend Error Handling

#### HTTP Status Codes
- `200 OK` - Request สำเร็จ
- `201 Created` - สร้างข้อมูลสำเร็จ
- `400 Bad Request` - ข้อมูล request ไม่ถูกต้อง
- `404 Not Found` - ไม่พบข้อมูลที่ต้องการ
- `409 Conflict` - ข้อมูลซ้ำหรือ conflict (เช่น โต๊ะถูกจองแล้ว)
- `500 Internal Server Error` - เกิดข้อผิดพลาดในระบบ

#### Error Response Format
```json
{
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```

#### Common Error Scenarios
1. **Table not available**: Return 409 Conflict
2. **Invalid booking reference**: Return 404 Not Found
3. **Validation errors**: Return 400 Bad Request with validation details
4. **Database connection errors**: Return 500 Internal Server Error
5. **Cannot delete table with active bookings**: Return 409 Conflict

### Validation Rules

#### User Registration Validation
- Username: required, unique, 3-50 characters, alphanumeric
- Email: required, unique, valid email format
- Password: required, minimum 6 characters
- Full name: required, 2-100 characters
- Phone number: required, 10 digits

#### Login Validation
- Email: required, valid email format
- Password: required

#### Booking Validation
- Number of guests: required, must be > 0 and <= table capacity
- Booking date: required, must be today or future date
- Time slot: required, must be one of predefined slots
- Table: must exist and be available for selected date/time
- User: must be authenticated

#### Table Validation
- Table number: required, unique, 1-10 characters
- Capacity: required, must be > 0

## Testing Strategy

### Unit Tests
- Service layer tests สำหรับ business logic
- Test booking reference generation
- Test availability checking logic
- Test validation rules

### Integration Tests
- API endpoint tests
- Database operations tests
- Test complete booking flow
- Test table management operations

### Manual Testing
- Test UI workflows ทั้งหมด
- Test responsive design
- Test error scenarios
- Test Docker deployment

### Test Data
- สร้าง seed data สำหรับ development:
  - Admin user: admin@restaurant.com / password: admin123
  - Customer users: 2-3 test customers
  - 5-10 โต๊ะ ขนาดต่างๆ (2, 4, 6, 8 ที่นั่ง)
  - Sample bookings สำหรับวันนี้และพรุ่งนี้

## Docker Configuration

### Services

#### 1. PostgreSQL Container
- Image: `postgres:15-alpine`
- Port: 5432
- Environment variables:
  - POSTGRES_DB=restaurant_booking
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
- Volume: persist database data

#### 2. Backend Container
- Base image: `mcr.microsoft.com/dotnet/aspnet:8.0`
- Build from Dockerfile
- Port: 5000
- Environment variables:
  - ConnectionStrings__DefaultConnection
  - ASPNETCORE_ENVIRONMENT=Development
- Depends on: PostgreSQL

#### 3. Frontend Container
- Base image: `nginx:alpine`
- Serve static files (HTML/CSS/JS)
- Port: 80
- Copy built TypeScript files
- Nginx configuration for SPA routing

### Docker Compose Structure
```yaml
version: '3.8'
services:
  db:
    # PostgreSQL configuration
  api:
    # Backend API configuration
  web:
    # Frontend configuration
```

## Security Considerations

### Authentication & Authorization

#### JWT Token
- ใช้ JWT (JSON Web Token) สำหรับ authentication
- Token payload ประกอบด้วย: userId, email, role, expiration
- Token expiration: 24 hours
- Token จะถูกส่งใน Authorization header: `Bearer {token}`

#### Password Security
- ใช้ BCrypt สำหรับ hash passwords
- Salt rounds: 10
- ไม่เก็บ plain text password ในฐานข้อมูล

#### Authorization Levels
1. **Public**: ไม่ต้อง login (ดูโต๊ะว่าง)
2. **Authenticated**: ต้อง login (จองโต๊ะ, ดูการจองของตัวเอง)
3. **Admin**: ต้อง login และมี role = admin (จัดการโต๊ะ, ดูการจองทั้งหมด)

#### Middleware
- JwtMiddleware: ตรวจสอบ JWT token และ extract user information
- Authorization attributes: [Authorize], [Authorize(Roles = "admin")]

### Basic Security Measures
- CORS configuration สำหรับ frontend
- Input validation ทั้ง frontend และ backend
- SQL injection prevention ด้วย Entity Framework Core
- Environment variables สำหรับ sensitive data (JWT secret, DB password)
- Password hashing ด้วย BCrypt
- JWT token expiration

### Future Enhancements (นอกเหนือจาก scope โปรเจค)
- HTTPS/SSL certificates
- Rate limiting
- Refresh tokens
- Email verification
- Password reset functionality
- Two-factor authentication

## Development Workflow

1. **Setup**: Clone repository และรัน `docker-compose up`
2. **Database**: Auto-migrate และ seed data เมื่อ start
3. **Development**:
   - Backend: Hot reload ด้วย `dotnet watch`
   - Frontend: Compile TypeScript และ refresh browser
4. **Testing**: Run tests ด้วย `dotnet test`
5. **API Documentation**: เข้าถึงผ่าน `http://localhost:5000/swagger`

## Performance Considerations

- Database indexing บน booking_date, reference, status
- Pagination สำหรับ booking list (ถ้ามีข้อมูลเยอะ)
- Connection pooling สำหรับ database
- Static file caching สำหรับ frontend assets
- Simple queries เพื่อ performance ที่ดี

## Deployment Notes

### Development Environment
```bash
docker-compose up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger
- Database: localhost:5432

### Production Considerations (สำหรับอนาคต)
- ใช้ environment-specific configuration
- Secure database credentials
- Enable HTTPS
- Configure proper logging
- Set up monitoring
