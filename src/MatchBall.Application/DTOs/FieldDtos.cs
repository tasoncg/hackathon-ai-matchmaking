using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record CreateFieldRequest(
    string Name,
    string Address,
    double Latitude,
    double Longitude,
    PricingModel PricingModel,
    decimal PricePerHour
);

public record FieldDto(
    Guid Id,
    string Name,
    string Address,
    Guid OwnerId,
    string OwnerName,
    double Rating,
    FieldStatus Status,
    PricingModel PricingModel,
    decimal PricePerHour,
    double Latitude,
    double Longitude,
    List<FieldTimeSlotDto> TimeSlots
);

public record FieldTimeSlotDto(
    Guid Id,
    DateTime StartTime,
    DateTime EndTime,
    decimal? Price,
    TimeSlotStatus Status
);

public record CreateTimeSlotRequest(
    DateTime StartTime,
    DateTime EndTime,
    decimal? Price
);
