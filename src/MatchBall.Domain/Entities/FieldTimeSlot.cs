using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class FieldTimeSlot
{
    public Guid Id { get; set; }
    public Guid FieldId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal? Price { get; set; } // Override default price
    public TimeSlotStatus Status { get; set; } = TimeSlotStatus.Available;

    // Navigation
    public Field Field { get; set; } = null!;
}
