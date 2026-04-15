using System.Security.Claims;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/teams/{teamId}/schedule")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly IScheduleService _service;

    public ScheduleController(IScheduleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TeamScheduleSlotDto>>> Get(Guid teamId)
    {
        var slots = await _service.GetByTeamAsync(teamId);
        return Ok(slots);
    }

    [HttpPost]
    public async Task<ActionResult<TeamScheduleSlotDto>> Create(Guid teamId, [FromBody] CreateScheduleSlotRequest req)
    {
        var slot = await _service.CreateAsync(teamId, GetUserId(), req);
        return Ok(slot);
    }

    [HttpPut("{slotId}")]
    public async Task<ActionResult<TeamScheduleSlotDto>> Update(Guid teamId, Guid slotId, [FromBody] UpdateScheduleSlotRequest req)
    {
        var slot = await _service.UpdateAsync(teamId, slotId, GetUserId(), req);
        return Ok(slot);
    }

    [HttpDelete("{slotId}")]
    public async Task<IActionResult> Delete(Guid teamId, Guid slotId)
    {
        await _service.DeleteAsync(teamId, slotId, GetUserId());
        return NoContent();
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
