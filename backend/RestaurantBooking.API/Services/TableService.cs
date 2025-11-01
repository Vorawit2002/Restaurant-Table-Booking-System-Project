using Microsoft.EntityFrameworkCore;
using RestaurantBooking.API.Data;
using RestaurantBooking.API.Models;
using RestaurantBooking.API.Models.DTOs;

namespace RestaurantBooking.API.Services;

public class TableService : ITableService
{
    private readonly ApplicationDbContext _context;

    public TableService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TableDto>> GetAllTablesAsync()
    {
        var tables = await _context.Tables
            .OrderBy(t => t.TableNumber)
            .Select(t => new TableDto
            {
                Id = t.Id,
                TableNumber = t.TableNumber,
                Capacity = t.Capacity,
                ImageUrl = t.ImageUrl
            })
            .ToListAsync();

        return tables;
    }

    public async Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, string timeSlot)
    {
        // Get all table IDs that are booked for the specified date and time slot
        var bookedTableIds = await _context.Bookings
            .Where(b => b.BookingDate == date 
                     && b.TimeSlot == timeSlot 
                     && b.Status == "confirmed")
            .Select(b => b.TableId)
            .ToListAsync();

        // Get all tables that are not in the booked list
        var availableTables = await _context.Tables
            .Where(t => !bookedTableIds.Contains(t.Id))
            .OrderBy(t => t.TableNumber)
            .Select(t => new TableDto
            {
                Id = t.Id,
                TableNumber = t.TableNumber,
                Capacity = t.Capacity,
                ImageUrl = t.ImageUrl
            })
            .ToListAsync();

        return availableTables;
    }

    public async Task<TableDto?> GetTableByIdAsync(int id)
    {
        var table = await _context.Tables
            .Where(t => t.Id == id)
            .Select(t => new TableDto
            {
                Id = t.Id,
                TableNumber = t.TableNumber,
                Capacity = t.Capacity
            })
            .FirstOrDefaultAsync();

        return table;
    }

    public async Task<TableDto> CreateTableAsync(CreateTableDto createTableDto)
    {
        // Check if table number already exists
        var existingTable = await _context.Tables
            .FirstOrDefaultAsync(t => t.TableNumber == createTableDto.TableNumber);

        if (existingTable != null)
        {
            throw new InvalidOperationException($"Table number '{createTableDto.TableNumber}' already exists");
        }

        var table = new Table
        {
            TableNumber = createTableDto.TableNumber,
            Capacity = createTableDto.Capacity,
            ImageUrl = createTableDto.ImageUrl,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tables.Add(table);
        await _context.SaveChangesAsync();

        return new TableDto
        {
            Id = table.Id,
            TableNumber = table.TableNumber,
            Capacity = table.Capacity,
            ImageUrl = table.ImageUrl
        };
    }

    public async Task<bool> UpdateTableAsync(int id, UpdateTableDto updateTableDto)
    {
        var table = await _context.Tables.FindAsync(id);
        if (table == null)
        {
            return false;
        }

        // Check if the new table number conflicts with another table
        if (table.TableNumber != updateTableDto.TableNumber)
        {
            var existingTable = await _context.Tables
                .FirstOrDefaultAsync(t => t.TableNumber == updateTableDto.TableNumber && t.Id != id);

            if (existingTable != null)
            {
                throw new InvalidOperationException($"Table number '{updateTableDto.TableNumber}' already exists");
            }
        }

        table.TableNumber = updateTableDto.TableNumber;
        table.Capacity = updateTableDto.Capacity;
        table.ImageUrl = updateTableDto.ImageUrl;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteTableAsync(int id)
    {
        var table = await _context.Tables
            .Include(t => t.Bookings)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (table == null)
        {
            return false;
        }

        // Check if table has any active (confirmed) bookings
        var hasActiveBookings = table.Bookings.Any(b => b.Status == "confirmed");
        if (hasActiveBookings)
        {
            throw new InvalidOperationException("Cannot delete table with active bookings");
        }

        _context.Tables.Remove(table);
        await _context.SaveChangesAsync();
        return true;
    }
}
