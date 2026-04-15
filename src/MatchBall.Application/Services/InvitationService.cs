using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class InvitationService : IInvitationService
{
    private readonly IRepository<MatchInvitation> _invRepo;
    private readonly IRepository<Team> _teamRepo;
    private readonly IRepository<Match> _matchRepo;
    private readonly IRepository<TeamScheduleSlot> _slotRepo;
    private readonly IRepository<TeamMember> _memberRepo;
    private readonly INotificationService _notifications;

    public InvitationService(
        IRepository<MatchInvitation> invRepo,
        IRepository<Team> teamRepo,
        IRepository<Match> matchRepo,
        IRepository<TeamScheduleSlot> slotRepo,
        IRepository<TeamMember> memberRepo,
        INotificationService notifications)
    {
        _invRepo = invRepo;
        _teamRepo = teamRepo;
        _matchRepo = matchRepo;
        _slotRepo = slotRepo;
        _memberRepo = memberRepo;
        _notifications = notifications;
    }

    public async Task<MatchInvitationDto> CreateAsync(Guid userId, CreateInvitationRequest req)
    {
        var fromTeam = await _teamRepo.GetByIdAsync(req.FromTeamId)
            ?? throw new InvalidOperationException("From team not found");
        var toTeam = await _teamRepo.GetByIdAsync(req.ToTeamId)
            ?? throw new InvalidOperationException("Target team not found");
        if (fromTeam.CaptainId != userId)
            throw new UnauthorizedAccessException("Only the team captain can send a challenge");
        if (req.FromTeamId == req.ToTeamId)
            throw new InvalidOperationException("Cannot challenge your own team");

        var invitation = new MatchInvitation
        {
            Id = Guid.NewGuid(),
            FromTeamId = req.FromTeamId,
            ToTeamId = req.ToTeamId,
            FromUserId = userId,
            ProposedTime = req.ProposedTime,
            Location = req.Location,
            FieldId = req.FieldId,
            Message = req.Message,
            Status = InvitationStatus.Pending
        };
        await _invRepo.AddAsync(invitation);

        await _notifications.CreateAsync(
            toTeam.CaptainId,
            "InvitationReceived",
            $"Challenge from {fromTeam.Name}",
            $"{fromTeam.Name} wants to play a match on {req.ProposedTime:g} at {req.Location}.",
            invitation.Id,
            $"/invitations/{invitation.Id}");

        return await LoadDtoAsync(invitation.Id);
    }

    public async Task<MatchInvitationDto> AcceptAsync(Guid invitationId, Guid userId)
    {
        var inv = await _invRepo.Query()
            .Include(i => i.FromTeam)
            .Include(i => i.ToTeam)
            .FirstOrDefaultAsync(i => i.Id == invitationId)
            ?? throw new InvalidOperationException("Invitation not found");

        if (inv.ToTeam.CaptainId != userId)
            throw new UnauthorizedAccessException("Only the invited team's captain can respond");
        if (inv.Status != InvitationStatus.Pending)
            throw new InvalidOperationException("Invitation already responded to");

        var match = new Match
        {
            Id = Guid.NewGuid(),
            TeamAId = inv.FromTeamId,
            TeamBId = inv.ToTeamId,
            MatchTime = inv.ProposedTime,
            Location = inv.Location,
            FieldId = inv.FieldId,
            Status = MatchStatus.Confirmed
        };
        await _matchRepo.AddAsync(match);

        inv.Status = InvitationStatus.Accepted;
        inv.MatchId = match.Id;
        inv.RespondedAt = DateTime.UtcNow;
        await _invRepo.UpdateAsync(inv);

        // Link match to existing schedule slots if any overlap same day/hour, otherwise create booked slots
        await LinkOrCreateSlot(inv.FromTeamId, inv.ProposedTime, inv.FieldId, inv.Location, match.Id);
        await LinkOrCreateSlot(inv.ToTeamId, inv.ProposedTime, inv.FieldId, inv.Location, match.Id);

        await _notifications.CreateAsync(
            inv.FromTeam.CaptainId,
            "InvitationAccepted",
            $"{inv.ToTeam.Name} accepted your challenge!",
            $"Match confirmed for {inv.ProposedTime:g} at {inv.Location}.",
            match.Id,
            $"/teams/{inv.FromTeamId}");

        return await LoadDtoAsync(invitationId);
    }

    public async Task<MatchInvitationDto> RejectAsync(Guid invitationId, Guid userId)
    {
        var inv = await _invRepo.Query()
            .Include(i => i.FromTeam)
            .Include(i => i.ToTeam)
            .FirstOrDefaultAsync(i => i.Id == invitationId)
            ?? throw new InvalidOperationException("Invitation not found");

        if (inv.ToTeam.CaptainId != userId)
            throw new UnauthorizedAccessException("Only the invited team's captain can respond");
        if (inv.Status != InvitationStatus.Pending)
            throw new InvalidOperationException("Invitation already responded to");

        inv.Status = InvitationStatus.Rejected;
        inv.RespondedAt = DateTime.UtcNow;
        await _invRepo.UpdateAsync(inv);

        await _notifications.CreateAsync(
            inv.FromTeam.CaptainId,
            "InvitationRejected",
            $"{inv.ToTeam.Name} declined your challenge",
            $"Your match request for {inv.ProposedTime:g} was declined.",
            inv.Id,
            $"/teams/{inv.FromTeamId}");

        return await LoadDtoAsync(invitationId);
    }

    public async Task<MatchInvitationDto?> GetByIdAsync(Guid invitationId)
    {
        var inv = await LoadRawAsync(invitationId);
        return inv == null ? null : await ToDtoAsync(inv);
    }

    public async Task<IEnumerable<MatchInvitationDto>> GetIncomingAsync(Guid teamId)
    {
        var list = await _invRepo.Query()
            .Include(i => i.FromTeam)
            .Include(i => i.ToTeam)
            .Where(i => i.ToTeamId == teamId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
        return await MapListAsync(list);
    }

    public async Task<IEnumerable<MatchInvitationDto>> GetOutgoingAsync(Guid teamId)
    {
        var list = await _invRepo.Query()
            .Include(i => i.FromTeam)
            .Include(i => i.ToTeam)
            .Where(i => i.FromTeamId == teamId)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
        return await MapListAsync(list);
    }

    private async Task LinkOrCreateSlot(Guid teamId, DateTime matchTime, Guid? fieldId, string location, Guid matchId)
    {
        var dow = matchTime.DayOfWeek;
        var hour = matchTime.Hour;
        var existing = await _slotRepo.Query()
            .FirstOrDefaultAsync(s => s.TeamId == teamId
                && s.DayOfWeek == dow
                && s.StartHour <= hour && s.EndHour > hour);
        if (existing != null)
        {
            existing.Status = ScheduleSlotStatus.Booked;
            existing.MatchId = matchId;
            if (fieldId.HasValue) existing.FieldId = fieldId;
            if (string.IsNullOrEmpty(existing.FieldName)) existing.FieldName = location;
            await _slotRepo.UpdateAsync(existing);
        }
        else
        {
            await _slotRepo.AddAsync(new TeamScheduleSlot
            {
                Id = Guid.NewGuid(),
                TeamId = teamId,
                DayOfWeek = dow,
                StartHour = hour,
                EndHour = Math.Min(24, hour + 2),
                FieldId = fieldId,
                FieldName = location,
                Status = ScheduleSlotStatus.Booked,
                MatchId = matchId,
                Notes = "Upcoming match"
            });
        }
    }

    private async Task<MatchInvitationDto> LoadDtoAsync(Guid id)
    {
        var inv = await LoadRawAsync(id) ?? throw new InvalidOperationException("Invitation not found");
        return await ToDtoAsync(inv);
    }

    private async Task<MatchInvitation?> LoadRawAsync(Guid id)
    {
        return await _invRepo.Query()
            .Include(i => i.FromTeam)
            .Include(i => i.ToTeam)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    private async Task<MatchInvitationDto> ToDtoAsync(MatchInvitation inv)
    {
        var members = await _memberRepo.Query()
            .Include(m => m.User)
            .Where(m => m.TeamId == inv.FromTeamId)
            .ToListAsync();
        var count = members.Count;
        var avgSkill = count == 0 ? 0.0 : members.Average(m => (int)m.User.SkillLevel);

        return new MatchInvitationDto(
            inv.Id,
            inv.FromTeamId,
            inv.FromTeam.Name,
            inv.FromTeam.BehaviorScore,
            avgSkill,
            count,
            inv.ToTeamId,
            inv.ToTeam.Name,
            inv.ProposedTime,
            inv.Location,
            inv.FieldId,
            inv.Message,
            inv.Status,
            inv.MatchId,
            inv.CreatedAt,
            inv.RespondedAt);
    }

    private async Task<List<MatchInvitationDto>> MapListAsync(List<MatchInvitation> list)
    {
        var result = new List<MatchInvitationDto>(list.Count);
        foreach (var i in list) result.Add(await ToDtoAsync(i));
        return result;
    }
}
