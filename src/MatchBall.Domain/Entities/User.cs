using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public SkillLevel SkillLevel { get; set; }
    public Position Position { get; set; }
    public UserRole Role { get; set; }
    public int Age { get; set; }
    public string Location { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Availability { get; set; } = "[]"; // JSON array of time slots
    public int ExperienceYears { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<TeamMember> TeamMembers { get; set; } = new List<TeamMember>();
    public ICollection<Team> CaptainedTeams { get; set; } = new List<Team>();
    public ICollection<Field> OwnedFields { get; set; } = new List<Field>();
}
