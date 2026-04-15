namespace MatchBall.Application.DTOs;

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    Guid? RelatedEntityId,
    string? Link,
    bool Read,
    DateTime CreatedAt
);
