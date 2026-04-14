using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface IFieldService
{
    Task<FieldDto> CreateFieldAsync(Guid ownerId, CreateFieldRequest request);
    Task<FieldDto?> GetFieldByIdAsync(Guid fieldId);
    Task<IEnumerable<FieldDto>> GetAllFieldsAsync();
    Task<FieldTimeSlotDto> AddTimeSlotAsync(Guid fieldId, Guid ownerId, CreateTimeSlotRequest request);
    Task<IEnumerable<FieldTimeSlotDto>> GetAvailableSlotsAsync(Guid fieldId);
}
