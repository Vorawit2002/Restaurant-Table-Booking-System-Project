using System.ComponentModel.DataAnnotations;

namespace RestaurantBooking.API.Models.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public int NumberOfGuests { get; set; }
    public int TableId { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public string BookingDate { get; set; } = string.Empty;
    public string TimeSlot { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class BookingRequestDto
{
    [Required(ErrorMessage = "Number of guests is required")]
    [Range(1, 100, ErrorMessage = "Number of guests must be between 1 and 100")]
    public int NumberOfGuests { get; set; }

    [Required(ErrorMessage = "Table ID is required")]
    public int TableId { get; set; }

    [Required(ErrorMessage = "Booking date is required")]
    public string BookingDate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Time slot is required")]
    public string TimeSlot { get; set; } = string.Empty;
}

public class BookingResponseDto
{
    public string Reference { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
