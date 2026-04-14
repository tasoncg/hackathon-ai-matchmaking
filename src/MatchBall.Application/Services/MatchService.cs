using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class MatchService : IMatchService
{
    private readonly IRepository<Match> _matchRepo;
    private readonly IRepository<MatchResult> _resultRepo;
    private readonly IRepository<Team> _teamRepo;
    private readonly IRepository<BehaviorLog> _behaviorRepo;

    public MatchService(
        IRepository<Match> matchRepo,
        IRepository<MatchResult> resultRepo,
        IRepository<Team> teamRepo,
        IRepository<BehaviorLog> behaviorRepo)
    {
        _matchRepo = matchRepo;
        _resultRepo = resultRepo;
        _teamRepo = teamRepo;
        _behaviorRepo = behaviorRepo;
    }

    public async Task<MatchDto> CreateMatchAsync(Guid teamAId, CreateMatchRequest request)
    {
        var match = new Match
        {
            Id = Guid.NewGuid(),
            TeamAId = teamAId,
            TeamBId = request.TeamBId,
            MatchTime = request.MatchTime,
            Location = request.Location,
            FieldId = request.FieldId,
            Status = MatchStatus.Pending
        };

        await _matchRepo.AddAsync(match);
        return await GetMatchByIdAsync(match.Id) ?? throw new InvalidOperationException("Failed to create match");
    }

    public async Task<MatchDto?> GetMatchByIdAsync(Guid matchId)
    {
        var match = await _matchRepo.Query()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Field)
            .Include(m => m.Result)
            .FirstOrDefaultAsync(m => m.Id == matchId);

        return match == null ? null : MapToDto(match);
    }

    public async Task<IEnumerable<MatchDto>> GetMatchesByTeamAsync(Guid teamId)
    {
        var matches = await _matchRepo.Query()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Field)
            .Include(m => m.Result)
            .Where(m => m.TeamAId == teamId || m.TeamBId == teamId)
            .OrderByDescending(m => m.MatchTime)
            .ToListAsync();

        return matches.Select(MapToDto);
    }

    public async Task<MatchDto> ConfirmMatchAsync(Guid matchId, Guid teamBCaptainId)
    {
        var match = await _matchRepo.Query()
            .Include(m => m.TeamB)
            .FirstOrDefaultAsync(m => m.Id == matchId)
            ?? throw new InvalidOperationException("Match not found");

        if (match.TeamB.CaptainId != teamBCaptainId)
            throw new UnauthorizedAccessException("Only Team B captain can confirm");

        match.Status = MatchStatus.Confirmed;
        await _matchRepo.UpdateAsync(match);

        return await GetMatchByIdAsync(matchId) ?? throw new InvalidOperationException("Match not found");
    }

    public async Task<MatchDto> CancelMatchAsync(Guid matchId, Guid captainId)
    {
        var match = await _matchRepo.Query()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .FirstOrDefaultAsync(m => m.Id == matchId)
            ?? throw new InvalidOperationException("Match not found");

        if (match.TeamA.CaptainId != captainId && match.TeamB.CaptainId != captainId)
            throw new UnauthorizedAccessException("Only team captains can cancel");

        match.Status = MatchStatus.Cancelled;
        await _matchRepo.UpdateAsync(match);

        // No-show penalty: -15
        var cancellingTeamId = match.TeamA.CaptainId == captainId ? match.TeamAId : match.TeamBId;
        await ApplyBehaviorChange(cancellingTeamId, matchId, -15, "Match cancelled / no-show");

        return await GetMatchByIdAsync(matchId) ?? throw new InvalidOperationException("Match not found");
    }

    public async Task<MatchDto> SubmitResultAsync(Guid matchId, Guid captainId, SubmitResultRequest request)
    {
        var match = await _matchRepo.Query()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Result)
            .FirstOrDefaultAsync(m => m.Id == matchId)
            ?? throw new InvalidOperationException("Match not found");

        if (match.TeamA.CaptainId != captainId && match.TeamB.CaptainId != captainId)
            throw new UnauthorizedAccessException("Only team captains can submit results");

        if (match.Result != null)
            throw new InvalidOperationException("Result already submitted");

        var submittingTeamId = match.TeamA.CaptainId == captainId ? match.TeamAId : match.TeamBId;

        var result = new MatchResult
        {
            Id = Guid.NewGuid(),
            MatchId = matchId,
            ScoreA = request.ScoreA,
            ScoreB = request.ScoreB,
            SubmittedBy = submittingTeamId,
            Confirmed = false
        };

        await _resultRepo.AddAsync(result);

        return await GetMatchByIdAsync(matchId) ?? throw new InvalidOperationException("Match not found");
    }

    public async Task<MatchDto> ConfirmResultAsync(Guid matchId, Guid captainId)
    {
        var match = await _matchRepo.Query()
            .Include(m => m.TeamA)
            .Include(m => m.TeamB)
            .Include(m => m.Result)
            .FirstOrDefaultAsync(m => m.Id == matchId)
            ?? throw new InvalidOperationException("Match not found");

        if (match.Result == null)
            throw new InvalidOperationException("No result to confirm");

        // The confirming team must be the OTHER team (not the one that submitted)
        var confirmingTeamId = match.TeamA.CaptainId == captainId ? match.TeamAId : match.TeamBId;
        if (confirmingTeamId == match.Result.SubmittedBy)
            throw new InvalidOperationException("Cannot confirm your own result submission");

        match.Result.Confirmed = true;
        match.Status = MatchStatus.Completed;
        await _matchRepo.UpdateAsync(match);

        // Behavior rewards: +5 completed, +3 confirmed
        await ApplyBehaviorChange(match.TeamAId, matchId, 5, "Match completed properly");
        await ApplyBehaviorChange(match.TeamBId, matchId, 5, "Match completed properly");
        await ApplyBehaviorChange(confirmingTeamId, matchId, 3, "Confirmed opponent result");

        return await GetMatchByIdAsync(matchId) ?? throw new InvalidOperationException("Match not found");
    }

    private async Task ApplyBehaviorChange(Guid teamId, Guid matchId, int change, string reason)
    {
        var team = await _teamRepo.GetByIdAsync(teamId);
        if (team == null) return;

        team.BehaviorScore = Math.Clamp(team.BehaviorScore + change, 1, 100);
        await _teamRepo.UpdateAsync(team);

        await _behaviorRepo.AddAsync(new BehaviorLog
        {
            Id = Guid.NewGuid(),
            TeamId = teamId,
            MatchId = matchId,
            ScoreChange = change,
            Reason = reason
        });
    }

    private static MatchDto MapToDto(Match m) => new(
        m.Id, m.TeamAId, m.TeamA.Name, m.TeamBId, m.TeamB.Name,
        m.MatchTime, m.Location, m.FieldId, m.Field?.Name,
        m.Status,
        m.Result == null ? null : new MatchResultDto(m.Result.ScoreA, m.Result.ScoreB, m.Result.Confirmed)
    );
}
