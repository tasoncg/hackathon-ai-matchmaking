using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class ScheduleService : IScheduleService
{
    private readonly IRepository<TeamScheduleSlot> _slotRepo;
    private readonly IRepository<Team> _teamRepo;
    private readonly IRepository<Match> _matchRepo;

    public ScheduleService(
        IRepository<TeamScheduleSlot> slotRepo,
        IRepository<Team> teamRepo,
        IRepository<Match> matchRepo)
    {
        _slotRepo = slotRepo;
        _teamRepo = teamRepo;
        _matchRepo = matchRepo;
    }

    public async Task<IEnumerable<TeamScheduleSlotDto>> GetByTeamAsync(Guid teamId)
    {
        var slots = await _slotRepo.Query()
            .Where(s => s.TeamId == teamId)
            .OrderBy(s => s.DayOfWeek).ThenBy(s => s.StartHour)
            .ToListAsync();

        // Attach upcoming match info from matches linked to this slot
        var matchIds = slots.Where(s => s.MatchId.HasValue).Select(s => s.MatchId!.Value).ToList();
        var matches = matchIds.Count == 0
            ? new Dictionary<Guid, Match>()
            : await _matchRepo.Query()
                .Include(m => m.TeamA).Include(m => m.TeamB)
                .Where(m => matchIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id);

        return slots.Select(s =>
        {
            string? opponentName = null;
            DateTime? matchTime = null;
            if (s.MatchId.HasValue && matches.TryGetValue(s.MatchId.Value, out var m))
            {
                opponentName = m.TeamAId == teamId ? m.TeamB.Name : m.TeamA.Name;
                matchTime = m.MatchTime;
            }
            return new TeamScheduleSlotDto(
                s.Id, s.TeamId, s.DayOfWeek, s.StartHour, s.EndHour,
                s.FieldId, s.FieldName, s.Status, s.MatchId,
                opponentName, matchTime, s.Notes);
        });
    }

    public async Task<TeamScheduleSlotDto> CreateAsync(Guid teamId, Guid userId, CreateScheduleSlotRequest req)
    {
        await EnsureCaptainAsync(teamId, userId);
        ValidateHours(req.StartHour, req.EndHour);

        var slot = new TeamScheduleSlot
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            DayOfWeek = req.DayOfWeek,
            StartHour = req.StartHour,
            EndHour = req.EndHour,
            FieldId = req.FieldId,
            FieldName = req.FieldName,
            Status = req.Status,
            Notes = req.Notes
        };
        await _slotRepo.AddAsync(slot);
        return ToDto(slot);
    }

    public async Task<TeamScheduleSlotDto> UpdateAsync(Guid teamId, Guid slotId, Guid userId, UpdateScheduleSlotRequest req)
    {
        await EnsureCaptainAsync(teamId, userId);
        ValidateHours(req.StartHour, req.EndHour);

        var slot = await _slotRepo.GetByIdAsync(slotId)
            ?? throw new InvalidOperationException("Slot not found");
        if (slot.TeamId != teamId)
            throw new InvalidOperationException("Slot does not belong to this team");

        slot.DayOfWeek = req.DayOfWeek;
        slot.StartHour = req.StartHour;
        slot.EndHour = req.EndHour;
        slot.FieldId = req.FieldId;
        slot.FieldName = req.FieldName;
        slot.Status = req.Status;
        slot.Notes = req.Notes;
        await _slotRepo.UpdateAsync(slot);
        return ToDto(slot);
    }

    public async Task DeleteAsync(Guid teamId, Guid slotId, Guid userId)
    {
        await EnsureCaptainAsync(teamId, userId);
        var slot = await _slotRepo.GetByIdAsync(slotId)
            ?? throw new InvalidOperationException("Slot not found");
        if (slot.TeamId != teamId)
            throw new InvalidOperationException("Slot does not belong to this team");
        await _slotRepo.DeleteAsync(slot);
    }

    private async Task EnsureCaptainAsync(Guid teamId, Guid userId)
    {
        var team = await _teamRepo.GetByIdAsync(teamId)
            ?? throw new InvalidOperationException("Team not found");
        if (team.CaptainId != userId)
            throw new UnauthorizedAccessException("Only the team captain can edit the schedule");
    }

    private static void ValidateHours(int start, int end)
    {
        if (start < 0 || start > 23 || end < 1 || end > 24 || end <= start)
            throw new InvalidOperationException("Invalid schedule hours");
    }

    private static TeamScheduleSlotDto ToDto(TeamScheduleSlot s) => new(
        s.Id, s.TeamId, s.DayOfWeek, s.StartHour, s.EndHour,
        s.FieldId, s.FieldName, s.Status, s.MatchId, null, null, s.Notes);
}
