using System.Text.Json;
using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class MatchmakingService : IMatchmakingService
{
    private readonly IRepository<Team> _teamRepo;
    private readonly IRepository<Match> _matchRepo;
    private readonly IRepository<TeamMember> _memberRepo;

    // Weights for scoring
    private const double SkillWeight = 0.30;
    private const double BehaviorWeight = 0.25;
    private const double AvailabilityWeight = 0.25;
    private const double LocationWeight = 0.15;
    private const double HistoryWeight = 0.05;

    public MatchmakingService(
        IRepository<Team> teamRepo,
        IRepository<Match> matchRepo,
        IRepository<TeamMember> memberRepo)
    {
        _teamRepo = teamRepo;
        _matchRepo = matchRepo;
        _memberRepo = memberRepo;
    }

    public async Task<IEnumerable<MatchSuggestion>> GetBestMatchesAsync(Guid teamId, int count = 3)
    {
        var team = await _teamRepo.Query()
            .Include(t => t.Members).ThenInclude(m => m.User)
            .FirstOrDefaultAsync(t => t.Id == teamId)
            ?? throw new InvalidOperationException("Team not found");

        var allTeams = await _teamRepo.Query()
            .Include(t => t.Members).ThenInclude(m => m.User)
            .Where(t => t.Id != teamId)
            .ToListAsync();

        // Get recent match history (last 30 days)
        var recentMatches = await _matchRepo.Query()
            .Where(m => (m.TeamAId == teamId || m.TeamBId == teamId)
                && m.MatchTime > DateTime.UtcNow.AddDays(-30))
            .ToListAsync();

        var recentOpponentIds = recentMatches
            .Select(m => m.TeamAId == teamId ? m.TeamBId : m.TeamAId)
            .ToHashSet();

        var suggestions = new List<MatchSuggestion>();

        foreach (var opponent in allTeams)
        {
            var (score, explanation) = CalculateMatchScore(team, opponent, recentOpponentIds);
            suggestions.Add(new MatchSuggestion(
                opponent.Id,
                opponent.Name,
                Math.Round(score, 1),
                opponent.BehaviorScore,
                opponent.Members.Any() ? Math.Round(opponent.Members.Average(m => (double)m.User.SkillLevel), 1) : 0,
                explanation
            ));
        }

        return suggestions
            .OrderByDescending(s => s.Score)
            .Take(count);
    }

    private (double Score, string Explanation) CalculateMatchScore(
        Team team, Team opponent, HashSet<Guid> recentOpponentIds)
    {
        var reasons = new List<string>();

        // 1. Skill similarity (0-100): closer skill = higher score
        double teamSkill = team.Members.Any() ? team.Members.Average(m => (double)m.User.SkillLevel) : 1;
        double oppSkill = opponent.Members.Any() ? opponent.Members.Average(m => (double)m.User.SkillLevel) : 1;
        double skillDiff = Math.Abs(teamSkill - oppSkill);
        double skillScore = Math.Max(0, 100 - (skillDiff * 50)); // max diff is 2 (Newbie vs SemiPro)
        reasons.Add($"Skill match: {skillScore:F0}/100");

        // 2. Behavior score (0-100): higher opponent behavior = better
        double behaviorScore = opponent.BehaviorScore;
        reasons.Add($"Behavior: {behaviorScore}/100");

        // 3. Availability overlap (0-100)
        double availScore = CalculateAvailabilityOverlap(team, opponent);
        reasons.Add($"Schedule overlap: {availScore:F0}/100");

        // 4. Location proximity (0-100): closer = higher
        double distance = HaversineDistance(team.Latitude, team.Longitude, opponent.Latitude, opponent.Longitude);
        double locationScore = Math.Max(0, 100 - (distance / 0.5)); // 50km = 0 score
        reasons.Add($"Distance: {distance:F1}km");

        // 5. History penalty: avoid recent rematches
        double historyScore = recentOpponentIds.Contains(opponent.Id) ? 0 : 100;
        if (recentOpponentIds.Contains(opponent.Id))
            reasons.Add("Recently played (penalty)");

        double totalScore = (skillScore * SkillWeight)
            + (behaviorScore * BehaviorWeight)
            + (availScore * AvailabilityWeight)
            + (locationScore * LocationWeight)
            + (historyScore * HistoryWeight);

        return (totalScore, string.Join(" | ", reasons));
    }

    private static double CalculateAvailabilityOverlap(Team team, Team opponent)
    {
        try
        {
            var teamSlots = GetTeamAvailability(team);
            var oppSlots = GetTeamAvailability(opponent);

            if (!teamSlots.Any() || !oppSlots.Any())
                return 50; // Neutral if no data

            var overlap = teamSlots.Intersect(oppSlots).Count();
            var total = teamSlots.Union(oppSlots).Count();

            return total == 0 ? 50 : (overlap * 100.0 / total);
        }
        catch
        {
            return 50; // Default neutral score
        }
    }

    private static HashSet<string> GetTeamAvailability(Team team)
    {
        var allSlots = new HashSet<string>();
        foreach (var member in team.Members)
        {
            try
            {
                var slots = JsonSerializer.Deserialize<List<string>>(member.User.Availability);
                if (slots != null) allSlots.UnionWith(slots);
            }
            catch { /* skip invalid JSON */ }
        }
        return allSlots;
    }

    /// <summary>
    /// Haversine formula to calculate distance between two lat/lng points in km
    /// </summary>
    private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371; // Earth radius in km
        var dLat = ToRad(lat2 - lat1);
        var dLon = ToRad(lon2 - lon1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRad(double deg) => deg * Math.PI / 180;
}
