namespace MatchBall.Domain.Entities;

public class MatchResult
{
    public Guid Id { get; set; }
    public Guid MatchId { get; set; }
    public int ScoreA { get; set; }
    public int ScoreB { get; set; }
    public Guid SubmittedBy { get; set; }
    public bool Confirmed { get; set; }
    public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Match Match { get; set; } = null!;
}
