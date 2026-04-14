using MatchBall.Application.DTOs;
using MatchBall.Application.Interfaces;
using MatchBall.Domain.Entities;
using MatchBall.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MatchBall.Application.Services;

public class FieldService : IFieldService
{
    private readonly IRepository<Field> _fieldRepo;
    private readonly IRepository<FieldTimeSlot> _slotRepo;

    public FieldService(IRepository<Field> fieldRepo, IRepository<FieldTimeSlot> slotRepo)
    {
        _fieldRepo = fieldRepo;
        _slotRepo = slotRepo;
    }

    public async Task<FieldDto> CreateFieldAsync(Guid ownerId, CreateFieldRequest request)
    {
        var field = new Field
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Address = request.Address,
            OwnerId = ownerId,
            Rating = 0,
            Status = FieldStatus.Available,
            PricingModel = request.PricingModel,
            PricePerHour = request.PricePerHour,
            Latitude = request.Latitude,
            Longitude = request.Longitude
        };

        await _fieldRepo.AddAsync(field);
        return await GetFieldByIdAsync(field.Id) ?? throw new InvalidOperationException("Failed to create field");
    }

    public async Task<FieldDto?> GetFieldByIdAsync(Guid fieldId)
    {
        var field = await _fieldRepo.Query()
            .Include(f => f.Owner)
            .Include(f => f.TimeSlots)
            .FirstOrDefaultAsync(f => f.Id == fieldId);

        return field == null ? null : MapToDto(field);
    }

    public async Task<IEnumerable<FieldDto>> GetAllFieldsAsync()
    {
        var fields = await _fieldRepo.Query()
            .Include(f => f.Owner)
            .Include(f => f.TimeSlots)
            .ToListAsync();

        return fields.Select(MapToDto);
    }

    public async Task<FieldTimeSlotDto> AddTimeSlotAsync(Guid fieldId, Guid ownerId, CreateTimeSlotRequest request)
    {
        var field = await _fieldRepo.GetByIdAsync(fieldId)
            ?? throw new InvalidOperationException("Field not found");

        if (field.OwnerId != ownerId)
            throw new UnauthorizedAccessException("Only the field owner can add time slots");

        var slot = new FieldTimeSlot
        {
            Id = Guid.NewGuid(),
            FieldId = fieldId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Price = request.Price,
            Status = TimeSlotStatus.Available
        };

        await _slotRepo.AddAsync(slot);
        return new FieldTimeSlotDto(slot.Id, slot.StartTime, slot.EndTime, slot.Price, slot.Status);
    }

    public async Task<IEnumerable<FieldTimeSlotDto>> GetAvailableSlotsAsync(Guid fieldId)
    {
        var slots = await _slotRepo.Query()
            .Where(s => s.FieldId == fieldId && s.Status == TimeSlotStatus.Available)
            .OrderBy(s => s.StartTime)
            .ToListAsync();

        return slots.Select(s => new FieldTimeSlotDto(s.Id, s.StartTime, s.EndTime, s.Price, s.Status));
    }

    private static FieldDto MapToDto(Field f) => new(
        f.Id, f.Name, f.Address, f.OwnerId, f.Owner.Name,
        f.Rating, f.Status, f.PricingModel, f.PricePerHour,
        f.Latitude, f.Longitude,
        f.TimeSlots.Select(s => new FieldTimeSlotDto(s.Id, s.StartTime, s.EndTime, s.Price, s.Status)).ToList()
    );
}
