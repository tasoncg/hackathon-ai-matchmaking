using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record CreateMatchRequest(
    Guid TeamBId,
    DateTime MatchTime,
    string Location,
    Guid? FieldId
);

public record MatchDto(
    Guid Id,
    Guid TeamAId,
    string TeamAName,
    Guid TeamBId,
    string TeamBName,
    DateTime MatchTime,
    string Location,
    Guid? FieldId,
    string? FieldName,
    MatchStatus Status,
    MatchResultDto? Result
);

public record MatchResultDto(
    int ScoreA,
    int ScoreB,
    bool Confirmed
);

public record SubmitResultRequest(int ScoreA, int ScoreB);
