-- Add description column to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS description VARCHAR(200);

-- Add comment
COMMENT ON COLUMN tables.description IS 'รายละเอียดเพิ่มเติมของโต๊ะ เช่น ริมหน้าต่าง, VIP, ในสวน';
