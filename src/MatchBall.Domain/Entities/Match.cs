using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class Match
{
    public Guid Id { get; set; }
    public Guid TeamAId { get; set; }
    public Guid TeamBId { get; set; }
    public DateTime MatchTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public Guid? FieldId { get; set; }
    public MatchStatus Status { get; set; } = MatchStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Team TeamA { get; set; } = null!;
    public Team TeamB { get; set; } = null!;
    public Field? Field { get; set; }
    public MatchResult? Result { get; set; }
    public ICollection<BehaviorLog> BehaviorLogs { get; set; } = new List<BehaviorLog>();
}
