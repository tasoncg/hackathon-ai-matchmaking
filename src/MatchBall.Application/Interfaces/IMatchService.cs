using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface IMatchService
{
    Task<MatchDto> CreateMatchAsync(Guid teamAId, CreateMatchRequest request);
    Task<MatchDto?> GetMatchByIdAsync(Guid matchId);
    Task<IEnumerable<MatchDto>> GetMatchesByTeamAsync(Guid teamId);
    Task<MatchDto> ConfirmMatchAsync(Guid matchId, Guid teamBCaptainId);
    Task<MatchDto> CancelMatchAsync(Guid matchId, Guid captainId);
    Task<MatchDto> SubmitResultAsync(Guid matchId, Guid captainId, SubmitResultRequest request);
    Task<MatchDto> ConfirmResultAsync(Guid matchId, Guid captainId);
}
