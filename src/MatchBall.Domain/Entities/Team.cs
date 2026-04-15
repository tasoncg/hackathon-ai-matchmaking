namespace MatchBall.Domain.Entities;

public class Team
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public Guid CaptainId { get; set; }
    public int BehaviorScore { get; set; } = 70; // Default starting score
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Captain { get; set; } = null!;
    public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
    public ICollection<Match> HomeMatches { get; set; } = new List<Match>();
    public ICollection<Match> AwayMatches { get; set; } = new List<Match>();
    public ICollection<BehaviorLog> BehaviorLogs { get; set; } = new List<BehaviorLog>();
    public ICollection<TeamScheduleSlot> ScheduleSlots { get; set; } = new List<TeamScheduleSlot>();
    public ICollection<MatchInvitation> SentInvitations { get; set; } = new List<MatchInvitation>();
    public ICollection<MatchInvitation> ReceivedInvitations { get; set; } = new List<MatchInvitation>();
}
