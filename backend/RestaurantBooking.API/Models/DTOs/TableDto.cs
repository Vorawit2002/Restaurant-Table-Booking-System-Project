using System.ComponentModel.DataAnnotations;

namespace RestaurantBooking.API.Models.DTOs;

public class TableDto
{
    public int Id { get; set; }
    public string TableNumber { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public string? ImageUrl { get; set; }
}

public class CreateTableDto
{
    [Required(ErrorMessage = "Table number is required")]
    [MaxLength(10, ErrorMessage = "Table number cannot exceed 10 characters")]
    public string TableNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Capacity is required")]
    [Range(1, 100, ErrorMessage = "Capacity must be between 1 and 100")]
    public int Capacity { get; set; }

    [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
    public string? ImageUrl { get; set; }
}

public class UpdateTableDto
{
    [Required(ErrorMessage = "Table number is required")]
    [MaxLength(10, ErrorMessage = "Table number cannot exceed 10 characters")]
    public string TableNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Capacity is required")]
    [Range(1, 100, ErrorMessage = "Capacity must be between 1 and 100")]
    public int Capacity { get; set; }

    [MaxLength(500, ErrorMessage = "Image URL cannot exceed 500 characters")]
    public string? ImageUrl { get; set; }
}
