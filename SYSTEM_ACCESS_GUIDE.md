# System Access Guide
## Restaurant Table Booking System

---

## Quick Start

### Start the System
```bash
docker-compose up -d
```

### Stop the System
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f
```

### Check Service Status
```bash
docker-compose ps
```

---

## Access URLs

### Frontend (Web Application)
**URL:** http://localhost  
**Description:** Main web interface for customers and admins

### Backend API
**URL:** http://localhost:5001/api  
**Description:** RESTful API endpoints

### Swagger UI (API Documentation)
**URL:** http://localhost:5001/swagger  
**Description:** Interactive API documentation and testing interface

### Database
**Host:** localhost  
**Port:** 5432  
**Database:** restaurant_booking  
**Username:** postgres  
**Password:** postgres

---

## Test Credentials

### Admin Account
- **Email:** admin@restaurant.com
- **Password:** admin123
- **Role:** admin
- **Permissions:** Full access to manage tables and view all bookings

### Customer Accounts
1. **John Doe**
   - **Email:** john@example.com
   - **Password:** password123
   - **Role:** customer

2. **Jane Smith**
   - **Email:** jane@example.com
   - **Password:** password123
   - **Role:** customer

---

## Frontend Pages

### Public Pages
- **Home:** http://localhost/index.html (requires login)
- **Login:** http://localhost/login.html
- **Register:** http://localhost/register.html

### Customer Pages (Requires Login)
- **Home/Search Tables:** http://localhost/index.html
- **Book Table:** http://localhost/booking.html
- **My Bookings:** http://localhost/my-bookings.html

### Admin Pages (Requires Admin Role)
- **Admin Dashboard:** http://localhost/admin.html
- **Manage Tables:** http://localhost/admin-tables.html
- **Manage Bookings:** http://localhost/admin-bookings.html

---

## API Endpoints

### Authentication
```
POST /api/auth/register    - Register new customer
POST /api/auth/login       - Login and get JWT token
```

### Tables (Public)
```
GET /api/tables                              - Get all tables
GET /api/tables/available?date=&timeSlot=    - Get available tables
```

### Tables (Admin Only)
```
POST   /api/tables        - Create new table
PUT    /api/tables/{id}   - Update table
DELETE /api/tables/{id}   - Delete table
```

### Bookings (Customer)
```
GET    /api/bookings/my      - Get my bookings
POST   /api/bookings         - Create booking
DELETE /api/bookings/{id}    - Cancel my booking
```

### Bookings (Admin)
```
GET /api/bookings?date=&status=    - Get all bookings with filters
```

---

## Time Slots

The system supports the following time slots:
- **11:00-13:00** (Lunch)
- **13:00-15:00** (Lunch)
- **17:00-19:00** (Dinner)
- **19:00-21:00** (Dinner)
- **21:00-23:00** (Dinner)

---

## Testing

### Run Integration Tests
```bash
./integration-test.sh
```

### Manual Testing with cURL

#### Login as Admin
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@restaurant.com","password":"admin123"}'
```

#### Get Available Tables
```bash
curl http://localhost:5001/api/tables/available?date=2025-11-02&timeSlot=19:00-21:00
```

#### Create Booking (requires token)
```bash
curl -X POST http://localhost:5001/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "numberOfGuests": 4,
    "tableId": 3,
    "bookingDate": "2025-11-02",
    "timeSlot": "19:00-21:00"
  }'
```

---

## Database Access

### Using psql
```bash
docker exec -it restaurant_booking_db psql -U postgres -d restaurant_booking
```

### Common Queries
```sql
-- View all users
SELECT id, username, email, role FROM users;

-- View all tables
SELECT * FROM tables;

-- View all bookings
SELECT b.reference, u.full_name, t.table_number, b.booking_date, b.time_slot, b.status
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN tables t ON b.table_id = t.id
ORDER BY b.booking_date DESC;

-- View today's bookings
SELECT * FROM bookings WHERE booking_date = CURRENT_DATE;
```

---

## Troubleshooting

### Port Already in Use
If port 5000 is already in use (common on macOS with AirPlay):
- The system is configured to use port 5001 instead
- Frontend API client is configured for http://localhost:5001/api

### Container Won't Start
```bash
# Check logs
docker-compose logs api

# Rebuild containers
docker-compose down
docker-compose up -d --build
```

### Database Connection Issues
```bash
# Check database health
docker exec restaurant_booking_db pg_isready -U postgres

# Restart database
docker-compose restart db
```

### Frontend Not Loading
```bash
# Check Nginx logs
docker-compose logs web

# Rebuild frontend
docker-compose up -d --build web
```

---

## Development

### Rebuild Specific Service
```bash
# Rebuild API only
docker-compose up -d --build api

# Rebuild frontend only
docker-compose up -d --build web
```

### View Real-time Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f db
```

### Reset Database
```bash
# Stop and remove containers with volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

---

## Production Deployment Checklist

- [ ] Change default passwords
- [ ] Update JWT secret key
- [ ] Configure HTTPS/SSL
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting
- [ ] Configure production database
- [ ] Set up automated backups
- [ ] Configure logging and monitoring
- [ ] Update environment variables
- [ ] Test all endpoints in production environment

---

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f`
2. Review the integration test report: `INTEGRATION_TEST_REPORT.md`
3. Test API endpoints via Swagger UI: http://localhost:5001/swagger
4. Verify database connectivity: `docker exec -it restaurant_booking_db psql -U postgres`

---

**Last Updated:** November 1, 2025  
**System Version:** 1.0.0  
**Status:** ✅ All Systems Operational
