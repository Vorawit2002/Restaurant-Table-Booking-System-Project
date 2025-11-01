using Microsoft.EntityFrameworkCore;
using RestaurantBooking.API.Data;
using RestaurantBooking.API.Models;
using RestaurantBooking.API.Models.DTOs;

namespace RestaurantBooking.API.Services;

public class BookingService : IBookingService
{
    private readonly ApplicationDbContext _context;

    public BookingService(ApplicationDbContext context)
    {
        _context = context;
    }



    public async Task<BookingResponseDto> CreateBookingAsync(int userId, BookingRequestDto bookingRequest)
    {
        // Validate time format (HH:MM)
        if (!TimeOnly.TryParse(bookingRequest.TimeSlot, out var bookingTime))
        {
            throw new ArgumentException("Invalid time format. Use HH:MM");
        }

        // Validate time range (10:00 - 21:00)
        if (bookingTime.Hour < 10 || bookingTime.Hour > 21 || (bookingTime.Hour == 21 && bookingTime.Minute > 0))
        {
            throw new ArgumentException("Booking time must be between 10:00 and 21:00");
        }

        // Parse booking date
        if (!DateOnly.TryParse(bookingRequest.BookingDate, out var bookingDate))
        {
            throw new ArgumentException("Invalid booking date format");
        }

        // Check if booking date is today or in the future
        if (bookingDate < DateOnly.FromDateTime(DateTime.UtcNow))
        {
            throw new ArgumentException("Booking date must be today or in the future");
        }

        // Check if table exists
        var table = await _context.Tables.FindAsync(bookingRequest.TableId);
        if (table == null)
        {
            throw new ArgumentException("Table not found");
        }

        // Validate number of guests against table capacity
        if (bookingRequest.NumberOfGuests > table.Capacity)
        {
            throw new ArgumentException($"Number of guests ({bookingRequest.NumberOfGuests}) exceeds table capacity ({table.Capacity})");
        }

        // Check if table is available for the selected date and time
        var isTableAvailable = await IsTableAvailableAsync(bookingRequest.TableId, bookingDate, bookingRequest.TimeSlot);
        if (!isTableAvailable)
        {
            throw new InvalidOperationException("Table is not available for the selected date and time");
        }

        // Generate unique booking reference
        var reference = await GenerateBookingReferenceAsync(bookingDate);

        // Create booking
        var booking = new Booking
        {
            Reference = reference,
            UserId = userId,
            NumberOfGuests = bookingRequest.NumberOfGuests,
            TableId = bookingRequest.TableId,
            BookingDate = bookingDate,
            TimeSlot = bookingRequest.TimeSlot,
            Status = "confirmed",
            CreatedAt = DateTime.UtcNow
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return new BookingResponseDto
        {
            Reference = reference,
            Message = "Booking created successfully"
        };
    }

    public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(int userId)
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Table)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.BookingDate)
            .ThenBy(b => b.TimeSlot)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                Reference = b.Reference,
                UserId = b.UserId,
                UserName = b.User.FullName,
                NumberOfGuests = b.NumberOfGuests,
                TableId = b.TableId,
                TableNumber = b.Table.TableNumber,
                BookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                TimeSlot = b.TimeSlot,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return bookings;
    }

    public async Task<IEnumerable<BookingDto>> GetAllBookingsAsync(string? date = null, string? status = null)
    {
        var query = _context.Bookings
            .Include(b => b.User)
            .Include(b => b.Table)
            .AsQueryable();

        // Filter by date if provided
        if (!string.IsNullOrEmpty(date) && DateOnly.TryParse(date, out var filterDate))
        {
            query = query.Where(b => b.BookingDate == filterDate);
        }

        // Filter by status if provided
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
        }

        var bookings = await query
            .OrderByDescending(b => b.BookingDate)
            .ThenBy(b => b.TimeSlot)
            .Select(b => new BookingDto
            {
                Id = b.Id,
                Reference = b.Reference,
                UserId = b.UserId,
                UserName = b.User.FullName,
                NumberOfGuests = b.NumberOfGuests,
                TableId = b.TableId,
                TableNumber = b.Table.TableNumber,
                BookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                TimeSlot = b.TimeSlot,
                Status = b.Status,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();

        return bookings;
    }

    public async Task<bool> CancelBookingAsync(int bookingId, int userId)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        
        if (booking == null)
        {
            return false;
        }

        // Verify that the booking belongs to the user
        if (booking.UserId != userId)
        {
            throw new UnauthorizedAccessException("You can only cancel your own bookings");
        }

        // Check if booking is already cancelled
        if (booking.Status == "cancelled")
        {
            throw new InvalidOperationException("Booking is already cancelled");
        }

        booking.Status = "cancelled";
        await _context.SaveChangesAsync();
        
        return true;
    }

    private async Task<bool> IsTableAvailableAsync(int tableId, DateOnly date, string timeSlot)
    {
        var existingBooking = await _context.Bookings
            .AnyAsync(b => b.TableId == tableId 
                        && b.BookingDate == date 
                        && b.TimeSlot == timeSlot 
                        && b.Status == "confirmed");

        return !existingBooking;
    }

    private async Task<string> GenerateBookingReferenceAsync(DateOnly bookingDate)
    {
        string reference;
        bool isUnique;

        do
        {
            // Format: BK{YYYYMMDD}{XXXX}
            var dateStr = bookingDate.ToString("yyyyMMdd");
            var randomStr = GenerateRandomString(4);
            reference = $"BK{dateStr}{randomStr}";

            // Check if reference is unique
            isUnique = !await _context.Bookings.AnyAsync(b => b.Reference == reference);
        }
        while (!isUnique);

        return reference;
    }

    private static string GenerateRandomString(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
    }
}
