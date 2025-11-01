# Restaurant Booking Frontend

Frontend สำหรับระบบจองโต๊ะอาหาร ใช้ Vite และ JavaScript

## เทคโนโลยีที่ใช้

- **Vite** - Build tool และ dev server
- **JavaScript (ES6+)** - ภาษาหลัก
- **HTML5** - โครงสร้างหน้าเว็บ
- **CSS3** - การจัดรูปแบบ
- **Nginx** - Web server สำหรับ production

## โครงสร้างโปรเจกต์

```
frontend/
├── public/              # ไฟล์ HTML
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── booking.html
│   ├── my-bookings.html
│   ├── admin.html
│   ├── admin-tables.html
│   └── admin-bookings.html
├── src/
│   ├── css/            # ไฟล์ CSS
│   │   └── main.css
│   └── js/             # ไฟล์ JavaScript
│       ├── api-client.js
│       ├── auth-service.js
│       ├── index.js
│       ├── login.js
│       ├── register.js
│       ├── booking.js
│       ├── my-bookings.js
│       ├── admin.js
│       ├── admin-tables.js
│       └── admin-bookings.js
├── dist/               # ไฟล์ที่ build แล้ว (สร้างโดย Vite)
├── vite.config.js      # การตั้งค่า Vite
├── package.json
├── Dockerfile
└── nginx.conf

```

## การติดตั้งและรัน

### Development Mode

```bash
# ติดตั้ง dependencies
npm install

# รัน dev server (port 3000)
npm run dev
```

### Production Build

```bash
# Build สำหรับ production
npm run build

# Preview production build
npm run preview
```

### Docker

```bash
# Build Docker image
docker build -t restaurant-booking-frontend .

# Run container
docker run -p 80:80 restaurant-booking-frontend
```

## คำสั่ง npm

- `npm run dev` - รัน development server
- `npm run build` - Build สำหรับ production
- `npm run preview` - Preview production build

## API Configuration

API endpoint ถูกกำหนดใน `src/js/api-client.js`:

```javascript
const baseUrl = 'http://localhost:5001/api'
```

สามารถเปลี่ยนได้ตามต้องการ

## Features

### สำหรับลูกค้า
- ลงทะเบียนและเข้าสู่ระบบ
- ค้นหาโต๊ะว่าง
- จองโต๊ะ
- ดูและยกเลิกการจอง

### สำหรับ Admin
- Dashboard แสดงสถิติ
- จัดการโต๊ะ (เพิ่ม แก้ไข ลบ)
- ดูการจองทั้งหมด
- กรองการจองตามวันที่และสถานะ

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
