using System.Security.Claims;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/fields")]
[Authorize]
public class FieldsController : ControllerBase
{
    private readonly IFieldService _fieldService;

    public FieldsController(IFieldService fieldService)
    {
        _fieldService = fieldService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FieldDto>>> GetAll()
    {
        var fields = await _fieldService.GetAllFieldsAsync();
        return Ok(fields);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FieldDto>> GetById(Guid id)
    {
        var field = await _fieldService.GetFieldByIdAsync(id);
        return field == null ? NotFound() : Ok(field);
    }

    [HttpPost]
    public async Task<ActionResult<FieldDto>> Create([FromBody] CreateFieldRequest request)
    {
        var field = await _fieldService.CreateFieldAsync(GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = field.Id }, field);
    }

    [HttpPost("{id}/timeslots")]
    public async Task<ActionResult<FieldTimeSlotDto>> AddTimeSlot(Guid id, [FromBody] CreateTimeSlotRequest request)
    {
        var slot = await _fieldService.AddTimeSlotAsync(id, GetUserId(), request);
        return Ok(slot);
    }

    [HttpGet("{id}/timeslots")]
    public async Task<ActionResult<IEnumerable<FieldTimeSlotDto>>> GetAvailableSlots(Guid id)
    {
        var slots = await _fieldService.GetAvailableSlotsAsync(id);
        return Ok(slots);
    }

    private Guid GetUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
