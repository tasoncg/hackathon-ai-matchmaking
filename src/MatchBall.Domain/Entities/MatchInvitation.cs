using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class MatchInvitation
{
    public Guid Id { get; set; }
    public Guid FromTeamId { get; set; }
    public Guid ToTeamId { get; set; }
    public Guid FromUserId { get; set; }
    public DateTime ProposedTime { get; set; }
    public string Location { get; set; } = string.Empty;
    public Guid? FieldId { get; set; }
    public string? Message { get; set; }
    public InvitationStatus Status { get; set; } = InvitationStatus.Pending;
    public Guid? MatchId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }

    public Team FromTeam { get; set; } = null!;
    public Team ToTeam { get; set; } = null!;
    public User FromUser { get; set; } = null!;
    public Field? Field { get; set; }
    public Match? Match { get; set; }
}
