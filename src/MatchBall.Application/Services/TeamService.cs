using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class TeamService : ITeamService
{
    private readonly IRepository<Team> _teamRepo;
    private readonly IRepository<TeamMember> _memberRepo;
    private readonly IRepository<User> _userRepo;

    public TeamService(
        IRepository<Team> teamRepo,
        IRepository<TeamMember> memberRepo,
        IRepository<User> userRepo)
    {
        _teamRepo = teamRepo;
        _memberRepo = memberRepo;
        _userRepo = userRepo;
    }

    public async Task<TeamDto> CreateTeamAsync(Guid captainId, CreateTeamRequest request)
    {
        var captain = await _userRepo.GetByIdAsync(captainId)
            ?? throw new InvalidOperationException("User not found");

        var team = new Team
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            CaptainId = captainId,
            BehaviorScore = 70
        };

        await _teamRepo.AddAsync(team);

        // Add captain as team member
        await _memberRepo.AddAsync(new TeamMember
        {
            TeamId = team.Id,
            UserId = captainId,
            Role = TeamMemberRole.Captain
        });

        return await GetTeamByIdAsync(team.Id) ?? throw new InvalidOperationException("Failed to create team");
    }

    public async Task<TeamDto?> GetTeamByIdAsync(Guid teamId)
    {
        var team = await _teamRepo.Query()
            .Include(t => t.Captain)
            .Include(t => t.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == teamId);

        return team == null ? null : MapToDto(team);
    }

    public async Task<IEnumerable<TeamDto>> GetAllTeamsAsync()
    {
        var teams = await _teamRepo.Query()
            .Include(t => t.Captain)
            .Include(t => t.Members).ThenInclude(m => m.User)
            .ToListAsync();

        return teams.Select(MapToDto);
    }

    public async Task<IEnumerable<TeamDto>> GetTeamsByUserAsync(Guid userId)
    {
        var teamIds = await _memberRepo.Query()
            .Where(m => m.UserId == userId)
            .Select(m => m.TeamId)
            .ToListAsync();

        var teams = await _teamRepo.Query()
            .Include(t => t.Captain)
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Where(t => teamIds.Contains(t.Id))
            .ToListAsync();

        return teams.Select(MapToDto);
    }

    public async Task<TeamDto> InvitePlayerAsync(Guid teamId, Guid captainId, Guid playerId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId)
            ?? throw new InvalidOperationException("Team not found");

        if (team.CaptainId != captainId)
            throw new UnauthorizedAccessException("Only the captain can invite players");

        var existing = await _memberRepo.Query()
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == playerId);

        if (existing != null)
            throw new InvalidOperationException("Player is already a team member");

        await _memberRepo.AddAsync(new TeamMember
        {
            TeamId = teamId,
            UserId = playerId,
            Role = TeamMemberRole.Player
        });

        return await GetTeamByIdAsync(teamId) ?? throw new InvalidOperationException("Team not found");
    }

    public async Task RemovePlayerAsync(Guid teamId, Guid captainId, Guid playerId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId)
            ?? throw new InvalidOperationException("Team not found");

        if (team.CaptainId != captainId)
            throw new UnauthorizedAccessException("Only the captain can remove players");

        var member = await _memberRepo.Query()
            .FirstOrDefaultAsync(m => m.TeamId == teamId && m.UserId == playerId)
            ?? throw new InvalidOperationException("Player not in team");

        await _memberRepo.DeleteAsync(member);
    }

    private static TeamDto MapToDto(Team t)
    {
        var members = t.Members.Select(m => new TeamMemberDto(
            m.UserId,
            m.User.Name,
            m.User.Nickname,
            m.User.Position.ToString(),
            m.User.SkillLevel.ToString(),
            m.Role.ToString()
        )).ToList();

        var avgSkill = t.Members.Any()
            ? t.Members.Average(m => (double)m.User.SkillLevel)
            : 0;

        return new TeamDto(
            t.Id, t.Name, t.Address, t.Latitude, t.Longitude,
            t.CaptainId, t.Captain.Name, t.BehaviorScore,
            t.Members.Count, avgSkill, members
        );
    }
}
