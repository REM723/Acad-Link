USE university_portal;

-- First, drop the existing phone_number column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS phone_number;

-- Add the phone_number column as optional
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL; 