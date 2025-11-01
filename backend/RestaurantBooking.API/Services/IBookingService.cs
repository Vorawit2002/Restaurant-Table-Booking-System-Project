using RestaurantBooking.API.Models.DTOs;

namespace RestaurantBooking.API.Services;

public interface IBookingService
{
    Task<BookingResponseDto> CreateBookingAsync(int userId, BookingRequestDto bookingRequest);
    Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId);
    Task<IEnumerable<BookingDto>> GetAllBookingsAsync(string? date = null, string? status = null);
    Task<bool> CancelBookingAsync(int bookingId, int userId);
}
