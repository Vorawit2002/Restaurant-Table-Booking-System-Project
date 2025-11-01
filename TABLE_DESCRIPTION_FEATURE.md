# เพิ่มฟีเจอร์รายละเอียดโต๊ะ (Table Description)

## สรุปการเปลี่ยนแปลง

เพิ่มฟิลด์ "รายละเอียด" (description) ให้กับโต๊ะ เพื่อให้สามารถระบุข้อมูลเพิ่มเติมเกี่ยวกับโต๊ะได้ เช่น:
- โต๊ะริมหน้าต่าง
- โต๊ะ VIP
- โต๊ะในสวน
- โต๊ะส่วนตัว
- โต๊ะกลางแจ้ง

## ไฟล์ที่แก้ไข

### Backend (C# .NET)

1. **database/add_table_description.sql** (ใหม่)
   - SQL migration สำหรับเพิ่มคอลัมน์ description
   - ความยาวสูงสุด 200 ตัวอักษร

2. **backend/RestaurantBooking.API/Models/Table.cs**
   - เพิ่มฟิลด์ `Description` (nullable, max 200 characters)

3. **backend/RestaurantBooking.API/Models/DTOs/TableDto.cs**
   - เพิ่ม `Description` ใน `TableDto`
   - เพิ่ม `Description` ใน `CreateTableDto` (optional)
   - เพิ่ม `Description` ใน `UpdateTableDto` (optional)

4. **backend/RestaurantBooking.API/Services/TableService.cs**
   - อัพเดท mapping ทุกจุดให้รวม `Description`
   - `GetAllTablesAsync()` - รวม description
   - `GetAvailableTablesAsync()` - รวม description
   - `GetTableByIdAsync()` - รวม description
   - `CreateTableAsync()` - รับและบันทึก description
   - `UpdateTableAsync()` - อัพเดท description

### Frontend (JavaScript/HTML/CSS)

5. **frontend/public/admin-tables.html**
   - เพิ่ม textarea สำหรับรายละเอียดในฟอร์มเพิ่ม/แก้ไขโต๊ะ
   - มี placeholder และ maxlength 200 ตัวอักษร
   - แสดงข้อความช่วยเหลือ "ไม่บังคับ - สูงสุด 200 ตัวอักษร"

6. **frontend/src/js/admin-tables.js**
   - แสดงรายละเอียดใต้หมายเลขโต๊ะในตาราง (สีเทา, ขนาดเล็ก)
   - เพิ่ม description ในฟอร์มแก้ไข
   - ส่ง description เมื่อสร้าง/อัพเดทโต๊ะ

7. **frontend/src/css/main.css**
   - เพิ่ม CSS สำหรับ textarea
   - กำหนด resize: vertical และ min-height: 80px

## วิธีใช้งาน

### 1. รัน SQL Migration
```bash
# เชื่อมต่อกับ PostgreSQL
psql -U postgres -d restaurant_booking

# รัน migration
\i database/add_table_description.sql
```

### 2. Restart Backend
```bash
cd backend/RestaurantBooking.API
dotnet run
```

### 3. ใช้งานใน Admin Panel
1. ไปที่หน้า "จัดการโต๊ะ"
2. เมื่อเพิ่มหรือแก้ไขโต๊ะ จะเห็นช่อง "รายละเอียด"
3. กรอกข้อมูลเพิ่มเติมเกี่ยวกับโต๊ะ (ไม่บังคับ)
4. รายละเอียดจะแสดงใต้หมายเลขโต๊ะในตาราง

## ตัวอย่างการใช้งาน

```
หมายเลขโต๊ะ: A1
จำนวนที่นั่ง: 4
รายละเอียด: โต๊ะริมหน้าต่าง วิวสวนสวย เหมาะสำหรับคู่รัก
```

```
หมายเลขโต๊ะ: VIP-1
จำนวนที่นั่ง: 8
รายละเอียด: ห้อง VIP ส่วนตัว มีเครื่องเสียง เหมาะสำหรับงานเลี้ยง
```

## หมายเหตุ

- ฟิลด์ description เป็น optional (ไม่บังคับ)
- ความยาวสูงสุด 200 ตัวอักษร
- รายละเอียดจะแสดงในหน้าจัดการโต๊ะเท่านั้น (ยังไม่แสดงในหน้าจองของลูกค้า)
