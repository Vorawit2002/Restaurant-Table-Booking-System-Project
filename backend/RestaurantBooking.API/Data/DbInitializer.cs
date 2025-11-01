using RestaurantBooking.API.Models;

namespace RestaurantBooking.API.Data;

public static class DbInitializer
{
    public static void Initialize(ApplicationDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Check if data already exists
        if (context.Users.Any())
        {
            return; // Database has been seeded
        }

        // Seed Admin User only
        var adminUser = new User
        {
            Username = "admin",
            Email = "admin@restaurant.com",
            PasswordHash = "admin123", // Plain text password (as per your requirement)
            FullName = "Admin User",
            PhoneNumber = "0812345678",
            Role = "admin",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        context.SaveChanges();
    }
}
