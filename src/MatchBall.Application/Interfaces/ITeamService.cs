using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface ITeamService
{
    Task<TeamDto> CreateTeamAsync(Guid captainId, CreateTeamRequest request);
    Task<TeamDto?> GetTeamByIdAsync(Guid teamId);
    Task<IEnumerable<TeamDto>> GetAllTeamsAsync();
    Task<IEnumerable<TeamDto>> GetTeamsByUserAsync(Guid userId);
    Task<TeamDto> InvitePlayerAsync(Guid teamId, Guid captainId, Guid playerId);
    Task RemovePlayerAsync(Guid teamId, Guid captainId, Guid playerId);
}
