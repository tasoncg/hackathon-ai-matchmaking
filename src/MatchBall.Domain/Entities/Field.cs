using MatchBall.Domain.Enums;

namespace MatchBall.Domain.Entities;

public class Field
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public double Rating { get; set; }
    public FieldStatus Status { get; set; } = FieldStatus.Available;
    public PricingModel PricingModel { get; set; } = PricingModel.Hourly;
    public decimal PricePerHour { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User Owner { get; set; } = null!;
    public ICollection<FieldTimeSlot> TimeSlots { get; set; } = new List<FieldTimeSlot>();
    public ICollection<Match> Matches { get; set; } = new List<Match>();
}
