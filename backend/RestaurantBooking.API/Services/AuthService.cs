using Microsoft.EntityFrameworkCore;
using RestaurantBooking.API.Data;
using RestaurantBooking.API.Models;
using BCrypt.Net;

namespace RestaurantBooking.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;

    public AuthService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<User?> RegisterAsync(string username, string email, string password, string fullName, string phoneNumber)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return null; // Email already exists
        }

        if (await _context.Users.AnyAsync(u => u.Username == username))
        {
            return null; // Username already exists
        }

        // WARNING: Storing password as plain text - NOT SECURE!
        // This is for development/testing only
        var passwordHash = password; // Store plain text password

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            FullName = fullName,
            PhoneNumber = phoneNumber,
            Role = "customer",
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return user;
    }

    public async Task<User?> LoginAsync(string email, string password)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user == null)
        {
            return null; // User not found
        }

        // WARNING: Plain text password comparison - NOT SECURE!
        // This is for development/testing only
        if (password != user.PasswordHash)
        {
            return null; // Invalid password
        }

        return user;
    }

    public async Task<User?> GetUserByIdAsync(int userId)
    {
        return await _context.Users.FindAsync(userId);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }
}
