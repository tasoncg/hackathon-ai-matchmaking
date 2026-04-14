namespace MatchBall.Application.DTOs;

public record CreateTeamRequest(
    string Name,
    string Address,
    double Latitude,
    double Longitude
);

public record TeamDto(
    Guid Id,
    string Name,
    string Address,
    double Latitude,
    double Longitude,
    Guid CaptainId,
    string CaptainName,
    int BehaviorScore,
    int MemberCount,
    double AverageSkillLevel,
    List<TeamMemberDto> Members
);

public record TeamMemberDto(
    Guid UserId,
    string Name,
    string Nickname,
    string Position,
    string SkillLevel,
    string Role
);

public record InviteRequest(Guid UserId);
