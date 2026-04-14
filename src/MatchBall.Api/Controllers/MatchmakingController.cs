using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/matchmaking")]
[Authorize]
public class MatchmakingController : ControllerBase
{
    private readonly IMatchmakingService _matchmakingService;

    public MatchmakingController(IMatchmakingService matchmakingService)
    {
        _matchmakingService = matchmakingService;
    }

    [HttpGet("{teamId}")]
    public async Task<ActionResult<IEnumerable<MatchSuggestion>>> GetBestMatches(Guid teamId, [FromQuery] int count = 3)
    {
        var suggestions = await _matchmakingService.GetBestMatchesAsync(teamId, count);
        return Ok(suggestions);
    }
}
