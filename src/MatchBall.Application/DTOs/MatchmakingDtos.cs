namespace MatchBall.Application.DTOs;

public record MatchSuggestion(
    Guid TeamId,
    string TeamName,
    double Score,
    int BehaviorScore,
    double AverageSkillLevel,
    string Explanation
);
