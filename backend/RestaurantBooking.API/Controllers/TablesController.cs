using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestaurantBooking.API.Models.DTOs;
using RestaurantBooking.API.Services;

namespace RestaurantBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TablesController : ControllerBase
{
    private readonly ITableService _tableService;
    private readonly ILogger<TablesController> _logger;

    public TablesController(ITableService tableService, ILogger<TablesController> logger)
    {
        _tableService = tableService;
        _logger = logger;
    }

    /// <summary>
    /// Get all tables in the restaurant
    /// </summary>
    /// <returns>List of all tables with their details</returns>
    /// <response code="200">Returns list of all tables</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<TableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<TableDto>>> GetAllTables()
    {
        try
        {
            var tables = await _tableService.GetAllTablesAsync();
            return Ok(tables);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all tables");
            return StatusCode(500, new { error = "An error occurred while retrieving tables" });
        }
    }

    /// <summary>
    /// Get available tables for a specific date and time slot
    /// </summary>
    /// <param name="date">Booking date in YYYY-MM-DD format (e.g., "2024-11-01")</param>
    /// <param name="timeSlot">Time slot - can be either "HH:MM" (e.g., "18:30") or "HH:MM-HH:MM" (e.g., "19:00-21:00")</param>
    /// <returns>List of available tables for the specified date and time</returns>
    /// <response code="200">Returns list of available tables</response>
    /// <response code="400">Invalid date format or time slot</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("available")]
    [ProducesResponseType(typeof(IEnumerable<TableDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<TableDto>>> GetAvailableTables(
        [FromQuery] string date,
        [FromQuery] string timeSlot)
    {
        try
        {
            // Validate date parameter
            if (string.IsNullOrWhiteSpace(date))
            {
                return BadRequest(new { error = "Date parameter is required" });
            }

            if (!DateOnly.TryParse(date, out var bookingDate))
            {
                return BadRequest(new { error = "Invalid date format. Use YYYY-MM-DD" });
            }

            // Validate time parameter
            if (string.IsNullOrWhiteSpace(timeSlot))
            {
                return BadRequest(new { error = "Time parameter is required" });
            }

            // Validate time format (HH:MM)
            if (!TimeOnly.TryParse(timeSlot, out var bookingTime))
            {
                return BadRequest(new { error = "Invalid time format. Use HH:MM (e.g., 18:30)" });
            }

            // Validate time range (10:00 - 21:00)
            if (bookingTime.Hour < 10 || bookingTime.Hour > 21 || (bookingTime.Hour == 21 && bookingTime.Minute > 0))
            {
                return BadRequest(new { error = "Time must be between 10:00 and 21:00" });
            }

            var availableTables = await _tableService.GetAvailableTablesAsync(bookingDate, timeSlot);
            return Ok(availableTables);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving available tables");
            return StatusCode(500, new { error = "An error occurred while retrieving available tables" });
        }
    }



    /// <summary>
    /// Create a new table (Admin only)
    /// </summary>
    /// <param name="createTableDto">Table creation data including table number and capacity</param>
    /// <returns>Created table with assigned ID</returns>
    /// <response code="201">Table created successfully</response>
    /// <response code="400">Invalid input data</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="403">Forbidden - Admin role required</response>
    /// <response code="409">Table number already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(typeof(TableDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<TableDto>> CreateTable([FromBody] CreateTableDto createTableDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var table = await _tableService.CreateTableAsync(createTableDto);
            return CreatedAtAction(nameof(GetAllTables), new { id = table.Id }, table);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating table");
            return StatusCode(500, new { error = "An error occurred while creating the table" });
        }
    }

    /// <summary>
    /// Update an existing table (Admin only)
    /// </summary>
    /// <param name="id">Table ID to update</param>
    /// <param name="updateTableDto">Updated table data including table number and capacity</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Table updated successfully</response>
    /// <response code="400">Invalid input data</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="403">Forbidden - Admin role required</response>
    /// <response code="404">Table not found</response>
    /// <response code="409">Table number already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateTable(int id, [FromBody] UpdateTableDto updateTableDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _tableService.UpdateTableAsync(id, updateTableDto);
            if (!result)
            {
                return NotFound(new { error = "Table not found" });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating table {TableId}", id);
            return StatusCode(500, new { error = "An error occurred while updating the table" });
        }
    }

    /// <summary>
    /// Delete a table (Admin only)
    /// </summary>
    /// <param name="id">Table ID to delete</param>
    /// <returns>No content on success</returns>
    /// <response code="204">Table deleted successfully</response>
    /// <response code="401">Unauthorized - JWT token required</response>
    /// <response code="403">Forbidden - Admin role required</response>
    /// <response code="404">Table not found</response>
    /// <response code="409">Cannot delete table with active bookings</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteTable(int id)
    {
        try
        {
            var result = await _tableService.DeleteTableAsync(id);
            if (!result)
            {
                return NotFound(new { error = "Table not found" });
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting table {TableId}", id);
            return StatusCode(500, new { error = "An error occurred while deleting the table" });
        }
    }
}
