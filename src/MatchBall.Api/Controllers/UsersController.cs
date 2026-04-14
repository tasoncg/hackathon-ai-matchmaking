using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MatchBall.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IRepository<User> _userRepo;

    public UsersController(IRepository<User> userRepo)
    {
        _userRepo = userRepo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        var users = await _userRepo.GetAllAsync();
        return Ok(users.Select(u => new UserDto(
            u.Id, u.Name, u.Nickname, u.Email, u.SkillLevel, u.Position,
            u.Role, u.Age, u.Location, u.Latitude, u.Longitude,
            u.Availability, u.ExperienceYears
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(Guid id)
    {
        var u = await _userRepo.GetByIdAsync(id);
        if (u == null) return NotFound();

        return Ok(new UserDto(
            u.Id, u.Name, u.Nickname, u.Email, u.SkillLevel, u.Position,
            u.Role, u.Age, u.Location, u.Latitude, u.Longitude,
            u.Availability, u.ExperienceYears
        ));
    }
}
