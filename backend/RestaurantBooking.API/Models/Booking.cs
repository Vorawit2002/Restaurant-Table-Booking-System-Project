using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RestaurantBooking.API.Models;

[Table("bookings")]
public class Booking
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("reference")]
    public string Reference { get; set; } = string.Empty;

    [Required]
    [Column("user_id")]
    public int UserId { get; set; }

    [Required]
    [Column("number_of_guests")]
    public int NumberOfGuests { get; set; }

    [Required]
    [Column("table_id")]
    public int TableId { get; set; }

    [Required]
    [Column("booking_date")]
    public DateOnly BookingDate { get; set; }

    [Required]
    [MaxLength(20)]
    [Column("time_slot")]
    public string TimeSlot { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    [Column("status")]
    public string Status { get; set; } = "confirmed";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [ForeignKey("TableId")]
    public Table Table { get; set; } = null!;
}
