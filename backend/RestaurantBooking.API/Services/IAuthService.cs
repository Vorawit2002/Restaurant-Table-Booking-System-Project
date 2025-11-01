using RestaurantBooking.API.Models;

namespace RestaurantBooking.API.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string username, string email, string password, string fullName, string phoneNumber);
    Task<User?> LoginAsync(string email, string password);
    Task<User?> GetUserByIdAsync(int userId);
    Task<User?> GetUserByEmailAsync(string email);
}
