using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class TeamMember
{
    public Guid TeamId { get; set; }
    public Guid UserId { get; set; }
    public TeamMemberRole Role { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Team Team { get; set; } = null!;
    public User User { get; set; } = null!;
}
