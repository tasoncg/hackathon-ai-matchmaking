using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface INotificationService
{
    Task CreateAsync(Guid userId, string type, string title, string message, Guid? relatedEntityId = null, string? link = null);
    Task<IEnumerable<NotificationDto>> GetForUserAsync(Guid userId);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkReadAsync(Guid notificationId, Guid userId);
    Task MarkAllReadAsync(Guid userId);
}
