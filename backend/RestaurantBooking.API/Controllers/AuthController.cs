using Microsoft.AspNetCore.Mvc;
using RestaurantBooking.API.Helpers;
using RestaurantBooking.API.Models.DTOs;
using RestaurantBooking.API.Services;

namespace RestaurantBooking.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly JwtHelper _jwtHelper;

    public AuthController(IAuthService authService, JwtHelper jwtHelper)
    {
        _authService = authService;
        _jwtHelper = jwtHelper;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    /// <param name="registerDto">User registration data including username, email, password, full name, and phone number</param>
    /// <returns>Success message on successful registration</returns>
    /// <response code="200">Registration successful</response>
    /// <response code="400">Invalid input data or validation failed</response>
    /// <response code="409">Username or email already exists</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Validation failed", details = ModelState });
        }

        var user = await _authService.RegisterAsync(
            registerDto.Username,
            registerDto.Email,
            registerDto.Password,
            registerDto.FullName,
            registerDto.PhoneNumber
        );

        if (user == null)
        {
            return Conflict(new { error = "Username or email already exists" });
        }

        return Ok(new { message = "Registration successful. Please login." });
    }

    /// <summary>
    /// Login with email and password to receive JWT token
    /// </summary>
    /// <param name="loginDto">Login credentials (email and password)</param>
    /// <returns>JWT token and user information</returns>
    /// <response code="200">Login successful, returns JWT token and user data</response>
    /// <response code="400">Invalid credentials or validation failed</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new { error = "Validation failed", details = ModelState });
        }

        var user = await _authService.LoginAsync(loginDto.Email, loginDto.Password);

        if (user == null)
        {
            return BadRequest(new { error = "Invalid email or password" });
        }

        var token = _jwtHelper.GenerateToken(user);

        var response = new LoginResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                PhoneNumber = user.PhoneNumber,
                Role = user.Role
            }
        };

        return Ok(response);
    }
}
