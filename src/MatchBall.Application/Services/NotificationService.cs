using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IRepository<Notification> _repo;

    public NotificationService(IRepository<Notification> repo)
    {
        _repo = repo;
    }

    public async Task CreateAsync(Guid userId, string type, string title, string message, Guid? relatedEntityId = null, string? link = null)
    {
        await _repo.AddAsync(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedEntityId = relatedEntityId,
            Link = link,
            Read = false
        });
    }

    public async Task<IEnumerable<NotificationDto>> GetForUserAsync(Guid userId)
    {
        var items = await _repo.Query()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Take(50)
            .ToListAsync();

        return items.Select(n => new NotificationDto(
            n.Id, n.Type, n.Title, n.Message, n.RelatedEntityId, n.Link, n.Read, n.CreatedAt));
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
    {
        return await _repo.Query().CountAsync(n => n.UserId == userId && !n.Read);
    }

    public async Task MarkReadAsync(Guid notificationId, Guid userId)
    {
        var n = await _repo.GetByIdAsync(notificationId);
        if (n == null || n.UserId != userId) return;
        n.Read = true;
        await _repo.UpdateAsync(n);
    }

    public async Task MarkAllReadAsync(Guid userId)
    {
        var items = await _repo.Query().Where(n => n.UserId == userId && !n.Read).ToListAsync();
        foreach (var n in items)
        {
            n.Read = true;
            await _repo.UpdateAsync(n);
        }
    }
}
