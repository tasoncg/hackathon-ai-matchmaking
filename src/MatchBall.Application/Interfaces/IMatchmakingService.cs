using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface IMatchmakingService
{
    Task<IEnumerable<MatchSuggestion>> GetBestMatchesAsync(Guid teamId, int count = 3);
}
