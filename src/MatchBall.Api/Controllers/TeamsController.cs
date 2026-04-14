using System.Security.Claims;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/teams")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetAll()
    {
        var teams = await _teamService.GetAllTeamsAsync();
        return Ok(teams);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TeamDto>> GetById(Guid id)
    {
        var team = await _teamService.GetTeamByIdAsync(id);
        return team == null ? NotFound() : Ok(team);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<TeamDto>>> GetMyTeams()
    {
        var teams = await _teamService.GetTeamsByUserAsync(GetUserId());
        return Ok(teams);
    }

    [HttpPost]
    public async Task<ActionResult<TeamDto>> Create([FromBody] CreateTeamRequest request)
    {
        var team = await _teamService.CreateTeamAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = team.Id }, team);
    }

    [HttpPost("{id}/invite")]
    public async Task<ActionResult<TeamDto>> Invite(Guid id, [FromBody] InviteRequest request)
    {
        var team = await _teamService.InvitePlayerAsync(id, GetUserId(), request.UserId);
        return Ok(team);
    }

    [HttpDelete("{teamId}/members/{playerId}")]
    public async Task<ActionResult> RemovePlayer(Guid teamId, Guid playerId)
    {
        await _teamService.RemovePlayerAsync(teamId, GetUserId(), playerId);
        return NoContent();
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
