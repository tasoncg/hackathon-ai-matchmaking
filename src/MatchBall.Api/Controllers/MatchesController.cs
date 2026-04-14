using System.Security.Claims;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/matches")]
[Authorize]
public class MatchesController : ControllerBase
{
    private readonly IMatchService _matchService;

    public MatchesController(IMatchService matchService)
    {
        _matchService = matchService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MatchDto>> GetById(Guid id)
    {
        var match = await _matchService.GetMatchByIdAsync(id);
        return match == null ? NotFound() : Ok(match);
    }

    [HttpGet("team/{teamId}")]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetByTeam(Guid teamId)
    {
        var matches = await _matchService.GetMatchesByTeamAsync(teamId);
        return Ok(matches);
    }

    [HttpPost]
    public async Task<ActionResult<MatchDto>> Create([FromBody] CreateMatchFromBody request)
    {
        var match = await _matchService.CreateMatchAsync(
            request.TeamAId,
            new CreateMatchRequest(request.TeamBId, request.MatchTime, request.Location, request.FieldId)
        );
        return CreatedAtAction(nameof(GetById), new { id = match.Id }, match);
    }

    [HttpPost("{id}/confirm")]
    public async Task<ActionResult<MatchDto>> Confirm(Guid id)
    {
        var match = await _matchService.ConfirmMatchAsync(id, GetUserId());
        return Ok(match);
    }

    [HttpPost("{id}/cancel")]
    public async Task<ActionResult<MatchDto>> Cancel(Guid id)
    {
        var match = await _matchService.CancelMatchAsync(id, GetUserId());
        return Ok(match);
    }

    [HttpPost("{id}/result")]
    public async Task<ActionResult<MatchDto>> SubmitResult(Guid id, [FromBody] SubmitResultRequest request)
    {
        var match = await _matchService.SubmitResultAsync(id, GetUserId(), request);
        return Ok(match);
    }

    [HttpPost("{id}/confirm-result")]
    public async Task<ActionResult<MatchDto>> ConfirmResult(Guid id)
    {
        var match = await _matchService.ConfirmResultAsync(id, GetUserId());
        return Ok(match);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}

public record CreateMatchFromBody(
    Guid TeamAId,
    Guid TeamBId,
    DateTime MatchTime,
    string Location,
    Guid? FieldId
);
