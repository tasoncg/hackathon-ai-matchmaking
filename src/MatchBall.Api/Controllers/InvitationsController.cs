using System.Security.Claims;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/invitations")]
[Authorize]
public class InvitationsController : ControllerBase
{
    private readonly IInvitationService _service;

    public InvitationsController(IInvitationService service)
    {
        _service = service;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MatchInvitationDto>> GetById(Guid id)
    {
        var inv = await _service.GetByIdAsync(id);
        return inv == null ? NotFound() : Ok(inv);
    }

    [HttpGet("incoming/{teamId}")]
    public async Task<ActionResult<IEnumerable<MatchInvitationDto>>> Incoming(Guid teamId)
    {
        var list = await _service.GetIncomingAsync(teamId);
        return Ok(list);
    }

    [HttpGet("outgoing/{teamId}")]
    public async Task<ActionResult<IEnumerable<MatchInvitationDto>>> Outgoing(Guid teamId)
    {
        var list = await _service.GetOutgoingAsync(teamId);
        return Ok(list);
    }

    [HttpPost]
    public async Task<ActionResult<MatchInvitationDto>> Create([FromBody] CreateInvitationRequest req)
    {
        var inv = await _service.CreateAsync(GetUserId(), req);
        return Ok(inv);
    }

    [HttpPost("{id}/accept")]
    public async Task<ActionResult<MatchInvitationDto>> Accept(Guid id)
    {
        var inv = await _service.AcceptAsync(id, GetUserId());
        return Ok(inv);
    }

    [HttpPost("{id}/reject")]
    public async Task<ActionResult<MatchInvitationDto>> Reject(Guid id)
    {
        var inv = await _service.RejectAsync(id, GetUserId());
        return Ok(inv);
    }

    private Guid GetUserId() => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
