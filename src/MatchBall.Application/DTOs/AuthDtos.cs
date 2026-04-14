using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record RegisterRequest(
    string Name,
    string Nickname,
    string Email,
    string Password,
    SkillLevel SkillLevel,
    Position Position,
    UserRole Role,
    int Age,
    string Location,
    double Latitude,
    double Longitude,
    string Availability,
    int ExperienceYears
);

public record LoginRequest(string Email, string Password);

public record AuthResponse(string Token, UserDto User);
