using MatchBall.Application.DTOs;

namespace MatchBall.Application.Interfaces;

public interface IInvitationService
{
    Task<MatchInvitationDto> CreateAsync(Guid userId, CreateInvitationRequest req);
    Task<MatchInvitationDto> AcceptAsync(Guid invitationId, Guid userId);
    Task<MatchInvitationDto> RejectAsync(Guid invitationId, Guid userId);
    Task<MatchInvitationDto?> GetByIdAsync(Guid invitationId);
    Task<IEnumerable<MatchInvitationDto>> GetIncomingAsync(Guid teamId);
    Task<IEnumerable<MatchInvitationDto>> GetOutgoingAsync(Guid teamId);
}
