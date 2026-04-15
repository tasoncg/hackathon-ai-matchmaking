using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class TeamScheduleSlot
{
    public Guid Id { get; set; }
    public Guid TeamId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public int StartHour { get; set; }
    public int EndHour { get; set; }
    public Guid? FieldId { get; set; }
    public string? FieldName { get; set; }
    public ScheduleSlotStatus Status { get; set; } = ScheduleSlotStatus.Available;
    public Guid? MatchId { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Team Team { get; set; } = null!;
    public Field? Field { get; set; }
    public Match? Match { get; set; }
}
