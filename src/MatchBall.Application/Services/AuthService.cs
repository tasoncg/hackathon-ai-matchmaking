using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace MatchBall.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepo;
    private readonly IConfiguration _config;

    public AuthService(IRepository<User> userRepo, IConfiguration config)
    {
        _userRepo = userRepo;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existing = (await _userRepo.FindAsync(u => u.Email == request.Email)).FirstOrDefault();
        if (existing != null)
            throw new InvalidOperationException("Email already registered");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Nickname = request.Nickname,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            SkillLevel = request.SkillLevel,
            Position = request.Position,
            Role = request.Role,
            Age = request.Age,
            Location = request.Location,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Availability = request.Availability,
            ExperienceYears = request.ExperienceYears
        };

        await _userRepo.AddAsync(user);

        var token = GenerateToken(user);
        return new AuthResponse(token, MapToDto(user));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = (await _userRepo.FindAsync(u => u.Email == request.Email)).FirstOrDefault()
            ?? throw new InvalidOperationException("Invalid credentials");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new InvalidOperationException("Invalid credentials");

        var token = GenerateToken(user);
        return new AuthResponse(token, MapToDto(user));
    }

    public async Task<UserDto?> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepo.GetByIdAsync(userId);
        return user == null ? null : MapToDto(user);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "MatchBallSuperSecretKey2024!@#$%"));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "MatchBall",
            audience: _config["Jwt:Audience"] ?? "MatchBall",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static UserDto MapToDto(User u) => new(
        u.Id, u.Name, u.Nickname, u.Email, u.SkillLevel, u.Position,
        u.Role, u.Age, u.Location, u.Latitude, u.Longitude,
        u.Availability, u.ExperienceYears
    );
}
