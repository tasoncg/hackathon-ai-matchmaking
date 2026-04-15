import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { invitationsApi, teamsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { MatchInvitation } from '../types';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';

export default function InvitationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [invitation, setInvitation] = useState<MatchInvitation | null>(null);
  const [isMyTeam, setIsMyTeam] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    invitationsApi
      .getById(id)
      .then(async ({ data }) => {
        setInvitation(data);
        // Check if current user is captain of receiving team
        if (user) {
          const myTeams = await teamsApi.getMy();
          const captained = myTeams.data.find((t) => t.captainId === user.id);
          setIsMyTeam(captained?.id === data.toTeamId);
        }
      })
      .finally(() => setLoading(false));
  }, [id, user]);

  const respond = async (action: 'accept' | 'reject') => {
    if (!id) return;
    setProcessing(true);
    try {
      const { data } =
        action === 'accept' ? await invitationsApi.accept(id) : await invitationsApi.reject(id);
      setInvitation(data);
    } catch {
      alert('Failed to respond');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }
  if (!invitation) return <div className="text-center py-20 text-gray-500">Invitation not found</div>;

  const skillLabel =
    invitation.fromTeamAverageSkillLevel < 0.5
      ? 'Newbie'
      : invitation.fromTeamAverageSkillLevel < 1.5
      ? 'Amateur'
      : 'SemiPro';

  const statusClass =
    invitation.status === 'Pending'
      ? 'bg-yellow-100 text-yellow-700'
      : invitation.status === 'Accepted'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Match Challenge</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sent {new Date(invitation.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClass}`}>
            {invitation.status}
          </span>
        </div>

        <div className="border border-gray-100 rounded-lg p-5 bg-gray-50/50 mb-4">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">
            Challenger
          </p>
          <Link
            to={`/teams/${invitation.fromTeamId}`}
            className="text-xl font-bold text-emerald-700 hover:underline"
          >
            {invitation.fromTeamName}
          </Link>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <ScoreBadge score={invitation.fromTeamBehaviorScore} label="Behavior" size="sm" />
            <SkillBadge level={skillLabel} />
            <span className="text-xs text-gray-500">{invitation.fromTeamMemberCount} players</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">When</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {new Date(invitation.proposedTime).toLocaleString()}
            </p>
          </div>
          <div className="border border-gray-100 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase font-semibold">Where</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{invitation.location}</p>
          </div>
        </div>

        {invitation.message && (
          <div className="border border-gray-100 rounded-lg p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Message</p>
            <p className="text-sm text-gray-700">{invitation.message}</p>
          </div>
        )}

        {invitation.status === 'Pending' && isMyTeam && (
          <div className="flex gap-3">
            <button
              onClick={() => respond('reject')}
              disabled={processing}
              className="flex-1 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 disabled:opacity-60"
            >
              Reject
            </button>
            <button
              onClick={() => respond('accept')}
              disabled={processing}
              className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {processing ? 'Processing...' : 'Accept Challenge'}
            </button>
          </div>
        )}

        {invitation.status === 'Accepted' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
            <p className="text-sm font-semibold text-emerald-700">Match confirmed!</p>
            <button
              onClick={() => navigate(`/teams/${invitation.toTeamId}`)}
              className="mt-2 text-xs text-emerald-600 hover:underline"
            >
              View team upcoming matches
            </button>
          </div>
        )}

        {invitation.status === 'Rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-sm text-red-700">
            This challenge was declined.
          </div>
        )}
      </div>
    </div>
  );
}
