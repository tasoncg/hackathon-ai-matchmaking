using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface IScheduleService
{
    Task<IEnumerable<TeamScheduleSlotDto>> GetByTeamAsync(Guid teamId);
    Task<TeamScheduleSlotDto> CreateAsync(Guid teamId, Guid userId, CreateScheduleSlotRequest req);
    Task<TeamScheduleSlotDto> UpdateAsync(Guid teamId, Guid slotId, Guid userId, UpdateScheduleSlotRequest req);
    Task DeleteAsync(Guid teamId, Guid slotId, Guid userId);
}
