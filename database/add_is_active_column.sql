-- Add is_active column to tables
ALTER TABLE tables ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update existing tables to be active
UPDATE tables SET is_active = true WHERE is_active IS NULL;
