namespace MatchBall.Domain.Entities;

public class BehaviorLog
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public Guid MatchId { get; set; }
    public int ScoreChange { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Team Team { get; set; } = null!;
    public Match Match { get; set; } = null!;
}
