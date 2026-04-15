using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record TeamScheduleSlotDto(
    Guid Id,
    Guid TeamId,
    DayOfWeek DayOfWeek,
    int StartHour,
    int EndHour,
    Guid? FieldId,
    string? FieldName,
    ScheduleSlotStatus Status,
    Guid? MatchId,
    string? OpponentName,
    DateTime? UpcomingMatchTime,
    string? Notes
);

public record CreateScheduleSlotRequest(
    DayOfWeek DayOfWeek,
    int StartHour,
    int EndHour,
    Guid? FieldId,
    string? FieldName,
    ScheduleSlotStatus Status,
    string? Notes
);

public record UpdateScheduleSlotRequest(
    DayOfWeek DayOfWeek,
    int StartHour,
    int EndHour,
    Guid? FieldId,
    string? FieldName,
    ScheduleSlotStatus Status,
    string? Notes
);
