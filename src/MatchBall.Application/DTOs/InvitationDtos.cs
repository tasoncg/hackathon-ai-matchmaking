using MatchBall.Domain.Enums;

namespace MatchBall.Application.DTOs;

public record CreateInvitationRequest(
    Guid FromTeamId,
    Guid ToTeamId,
    DateTime ProposedTime,
    string Location,
    Guid? FieldId,
    string? Message
);

public record MatchInvitationDto(
    Guid Id,
    Guid FromTeamId,
    string FromTeamName,
    int FromTeamBehaviorScore,
    double FromTeamAverageSkillLevel,
    int FromTeamMemberCount,
    Guid ToTeamId,
    string ToTeamName,
    DateTime ProposedTime,
    string Location,
    Guid? FieldId,
    string? Message,
    InvitationStatus Status,
    Guid? MatchId,
    DateTime CreatedAt,
    DateTime? RespondedAt
);
