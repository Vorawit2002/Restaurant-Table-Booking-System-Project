using RestaurantBooking.API.Models.DTOs;

namespace RestaurantBooking.API.Services;

public interface ITableService
{
    Task<IEnumerable<TableDto>> GetAllTablesAsync();
    Task<IEnumerable<TableDto>> GetAvailableTablesAsync(DateOnly date, string timeSlot);
    Task<TableDto?> GetTableByIdAsync(int id);
    Task<TableDto> CreateTableAsync(CreateTableDto createTableDto);
    Task<bool> UpdateTableAsync(int id, UpdateTableDto updateTableDto);
    Task<bool> DeleteTableAsync(int id);
}
