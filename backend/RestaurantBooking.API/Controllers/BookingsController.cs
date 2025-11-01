using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantBooking.API.Models.DTOs;
using RestaurantBooking.API.Services;

namespace RestaurantBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(IBookingService bookingService, ILogger<BookingsController> logger)
    {
        _bookingService = bookingService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new booking (Authenticated users only)
    /// </summary>
    /// <param name="bookingRequest">Booking request data including number of guests, table ID, booking date, and time slot</param>
    /// <returns>Booking confirmation with unique reference number</returns>
    /// <response code="201">Booking created successfully with reference number</response>
    /// <response code="400">Invalid input data or validation failed</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="409">Table not available for selected date and time</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(BookingResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<BookingResponseDto>> CreateBooking([FromBody] BookingRequestDto bookingRequest)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Get user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Invalid user token" });
            }

            var response = await _bookingService.CreateBookingAsync(userId, bookingRequest);
            return CreatedAtAction(nameof(GetMyBookings), null, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating booking");
            return StatusCode(500, new { error = "An error occurred while creating the booking" });
        }
    }

    /// <summary>
    /// Get all bookings for the authenticated user
    /// </summary>
    /// <returns>List of user's bookings including past, upcoming, and cancelled bookings</returns>
    /// <response code="200">Returns list of user's bookings</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("my")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
    {
        try
        {
            // Get user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Invalid user token" });
            }

            var bookings = await _bookingService.GetUserBookingsAsync(userId);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user bookings");
            return StatusCode(500, new { error = "An error occurred while retrieving bookings" });
        }
    }

    /// <summary>
    /// Cancel a booking (Users can only cancel their own bookings)
    /// </summary>
    /// <param name="id">Booking ID to cancel</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Booking cancelled successfully</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="403">Forbidden - Can only cancel own bookings</response>
    /// <response code="404">Booking not found</response>
    /// <response code="409">Booking already cancelled</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> CancelBooking(int id)
    {
        try
        {
            // Get user ID from JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                return Unauthorized(new { error = "Invalid user token" });
            }

            var result = await _bookingService.CancelBookingAsync(id, userId);
            if (!result)
            {
                return NotFound(new { error = "Booking not found" });
            }

            return NoContent();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling booking {BookingId}", id);
            return StatusCode(500, new { error = "An error occurred while cancelling the booking" });
        }
    }

    /// <summary>
    /// Get all bookings from all customers with optional filters (Admin only)
    /// </summary>
    /// <param name="date">Optional filter by date in YYYY-MM-DD format (e.g., "2024-11-01")</param>
    /// <param name="status">Optional filter by status - valid values: "confirmed" or "cancelled"</param>
    /// <returns>List of all bookings matching the filters</returns>
    /// <response code="200">Returns list of all bookings</response>
    /// <response code="400">Invalid filter parameters</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="403">Forbidden - Admin role required</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAllBookings(
        [FromQuery] string? date = null,
        [FromQuery] string? status = null)
    {
        try
        {
            // Validate status if provided
            if (!string.IsNullOrEmpty(status) && status != "confirmed" && status != "cancelled")
            {
                return BadRequest(new { error = "Invalid status. Valid values: confirmed, cancelled" });
            }

            var bookings = await _bookingService.GetAllBookingsAsync(date, status);
            return Ok(bookings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all bookings");
            return StatusCode(500, new { error = "An error occurred while retrieving bookings" });
        }
    }
}
