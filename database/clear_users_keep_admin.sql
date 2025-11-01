-- Script to delete all users except admin users
-- Keep only users with role = 'admin'

-- First, delete all bookings from non-admin users
DELETE FROM "Bookings" 
WHERE "UserId" IN (
    SELECT "Id" FROM "Users" WHERE "Role" != 'admin'
);

-- Then delete all non-admin users
DELETE FROM "Users" 
WHERE "Role" != 'admin';

-- Show remaining users (should only be admins)
SELECT "Id", "Username", "Email", "FullName", "Role" 
FROM "Users" 
ORDER BY "Id";
