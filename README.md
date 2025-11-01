# Restaurant Table Booking System Project

ระบบจองโต๊ะอาหารออนไลน์ที่พัฒนาด้วย .NET Core Web API และ Vanilla JavaScript

## 🚀 Features

- **ระบบจองโต๊ะ**: ลูกค้าสามารถค้นหาและจองโต๊ะได้ตามวันที่และเวลาที่ต้องการ
- **ระบบแนะนำโต๊ะอัจฉริยะ**: แสดงโต๊ะที่เหมาะสมกับจำนวนคนโดยอัตโนมัติ
- **ระบบจัดการสำหรับ Admin**: จัดการโต๊ะและการจองทั้งหมด
- **Authentication & Authorization**: ระบบ JWT-based authentication
- **Responsive Design**: รองรับการใช้งานบนทุกอุปกรณ์

## 🛠️ Tech Stack

### Backend
- .NET 8.0 Web API
- PostgreSQL Database
- Entity Framework Core
- JWT Authentication
- Docker

### Frontend
- Vanilla JavaScript (ES6+)
- Vite Build Tool
- CSS3 with Modern Design
- Responsive Layout

## 📋 Prerequisites

- Docker & Docker Compose
- Node.js 18+ (สำหรับ Frontend Development)
- .NET 8.0 SDK (สำหรับ Backend Development)

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/Vorawit2002/Restaurant-Table-Booking-System-Project.git
cd Restaurant-Table-Booking-System-Project
```

### 2. Start Backend with Docker

```bash
docker-compose up -d
```

Backend API จะทำงานที่: `http://localhost:5001`

### 3. Start Frontend Development Server

```bash
cd frontend
npm install
npm run dev
```

Frontend จะทำงานที่: `http://localhost:3000`

## 📝 Default Credentials

**Admin Account:**
- Email: `admin@restaurant.com`
- Password: `Admin123!`

## 🗂️ Project Structure

```
.
├── backend/
│   └── RestaurantBooking.API/
│       ├── Controllers/
│       ├── Models/
│       ├── Services/
│       ├── Data/
│       └── Helpers/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── booking.html
│   │   └── my-bookings.html
│   └── src/
│       ├── js/
│       └── css/
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Backend Configuration

แก้ไขไฟล์ `backend/RestaurantBooking.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=restaurant_booking;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "your-secret-key-here",
    "Issuer": "RestaurantBookingAPI",
    "Audience": "RestaurantBookingClient",
    "ExpirationInMinutes": 60
  }
}
```

### Frontend Configuration

แก้ไขไฟล์ `frontend/src/js/api-client.js`:

```javascript
constructor(baseUrl = 'http://localhost:5001/api') {
  this.baseUrl = baseUrl;
}
```

## 📚 API Documentation

เมื่อ Backend ทำงานแล้ว สามารถเข้าถึง Swagger UI ได้ที่:
`http://localhost:5001/swagger`

## 🎯 Key Features Details

### การค้นหาโต๊ะ
- เลือกจำนวนคน (1-20 คน)
- เลือกวันที่จอง
- เลือกเวลา (10:00 - 21:00 ทุก 30 นาที)
- ระบบจะแสดงเฉพาะโต๊ะที่เหมาะสม (ไม่เกิน 2 เท่าของจำนวนคน)

### ระบบแนะนำโต๊ะ
- แสดงโต๊ะที่มีขนาดพอดีกับจำนวนคนก่อน
- ถ้าไม่มีโต๊ะขนาดนั้น จะแสดงโต๊ะขนาดถัดไป
- เรียงลำดับจากโต๊ะเล็กไปใหญ่

### การจัดการการจอง
- ดูประวัติการจองทั้งหมด
- ยกเลิกการจองได้
- กรองการจองตามสถานะ

## 🐳 Docker Services

- **API**: .NET Web API (Port 5001)
- **Database**: PostgreSQL (Port 5432)
- **pgAdmin**: Database Management Tool (Port 5050)

## 🔐 Security

- JWT-based authentication
- Password hashing (plain text in development mode)
- Role-based authorization (Admin/Customer)
- CORS configuration

## 📱 Responsive Design

- รองรับ Desktop, Tablet, และ Mobile
- Modern UI/UX design
- Smooth animations และ transitions

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue เพื่อหารือก่อน

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Vorawit2002

## 🙏 Acknowledgments

- .NET Core Team
- Vite Team
- PostgreSQL Community
