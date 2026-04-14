using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record UserDto(
    Guid Id,
    string Name,
    string Nickname,
    string Email,
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
