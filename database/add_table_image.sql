-- Add image_url column to tables table
ALTER TABLE tables 
ADD COLUMN image_url VARCHAR(500);

-- Update existing table with a default image (optional)
-- UPDATE tables SET image_url = 'https://via.placeholder.com/300x200?text=Table' WHERE image_url IS NULL;
