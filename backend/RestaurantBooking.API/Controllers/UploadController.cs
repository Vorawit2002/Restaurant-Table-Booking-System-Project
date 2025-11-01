using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RestaurantBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<UploadController> _logger;

    public UploadController(IWebHostEnvironment environment, ILogger<UploadController> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    /// <summary>
    /// Upload an image file (Admin only)
    /// </summary>
    /// <param name="file">Image file to upload</param>
    /// <returns>URL of the uploaded image</returns>
    [HttpPost("image")]
    [Authorize(Roles = "admin")]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file uploaded" });
            }

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(new { error = "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." });
            }

            // Validate file size (5MB)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { error = "File size exceeds 5MB limit" });
            }

            // Create uploads directory if it doesn't exist
            var uploadsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "tables");
            if (!Directory.Exists(uploadsPath))
            {
                Directory.CreateDirectory(uploadsPath);
            }

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadsPath, fileName);

            // Save file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return URL
            var imageUrl = $"/uploads/tables/{fileName}";
            
            return Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, new { error = "An error occurred while uploading the image" });
        }
    }

    /// <summary>
    /// Delete an uploaded image (Admin only)
    /// </summary>
    /// <param name="fileName">Name of the file to delete</param>
    /// <returns>Success message</returns>
    [HttpDelete("image/{fileName}")]
    [Authorize(Roles = "admin")]
    public IActionResult DeleteImage(string fileName)
    {
        try
        {
            var filePath = Path.Combine(_environment.ContentRootPath, "wwwroot", "uploads", "tables", fileName);
            
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                return Ok(new { message = "Image deleted successfully" });
            }
            
            return NotFound(new { error = "Image not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image");
            return StatusCode(500, new { error = "An error occurred while deleting the image" });
        }
    }
}
