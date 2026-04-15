import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  teamsApi,
  matchmakingApi,
  matchesApi,
  usersApi,
  scheduleApi,
  invitationsApi,
} from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Team, MatchSuggestion, User, TeamScheduleSlot, Match } from '../types';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';
import WeeklySchedule from '../components/WeeklySchedule';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [schedule, setSchedule] = useState<TeamScheduleSlot[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [myTeamIdForChallenge, setMyTeamIdForChallenge] = useState<string | null>(null);
  const [challengeForm, setChallengeForm] = useState({ matchTime: '', location: '', message: '' });
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadAll(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAll = async (teamId: string) => {
    try {
      const [teamRes, sugRes, schRes, matchRes] = await Promise.all([
        teamsApi.getById(teamId),
        matchmakingApi.getBestMatches(teamId, 5),
        scheduleApi.getByTeam(teamId),
        matchesApi.getByTeam(teamId),
      ]);
      setTeam(teamRes.data);
      setSuggestions(sugRes.data);
      setSchedule(schRes.data);
      const now = Date.now();
      const upcoming = matchRes.data
        .filter((m) => new Date(m.matchTime).getTime() >= now - 3600_000 &&
          (m.status === 'Confirmed' || m.status === 'Pending'))
        .sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());
      setUpcomingMatches(upcoming);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    // Find which of the viewer's own teams they lead, to use as FromTeam when challenging
    teamsApi.getMy().then((res) => {
      const captained = res.data.find((t) => t.captainId === user.id);
      setMyTeamIdForChallenge(captained?.id ?? null);
    });
  }, [user]);

  const handleInvite = async (userId: string) => {
    if (!id) return;
    try {
      await teamsApi.invite(id, userId);
      loadAll(id);
      setShowInvite(false);
    } catch {
      alert('Failed to invite player');
    }
  };

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !myTeamIdForChallenge) return;
    setSending(true);
    try {
      await invitationsApi.create({
        fromTeamId: myTeamIdForChallenge,
        toTeamId: id,
        proposedTime: new Date(challengeForm.matchTime).toISOString(),
        location: challengeForm.location,
        message: challengeForm.message || null,
      });
      setShowChallengeModal(false);
      setChallengeSuccess(true);
      setChallengeForm({ matchTime: '', location: '', message: '' });
      setTimeout(() => setChallengeSuccess(false), 2500);
    } catch {
      alert('Failed to send challenge');
    } finally {
      setSending(false);
    }
  };

  const loadUsers = async () => {
    const { data } = await usersApi.getAll();
    setAllUsers(data);
    setShowInvite(true);
  };

  const isCaptainOfThisTeam = team?.captainId === user?.id;
  const canChallenge = !!myTeamIdForChallenge && myTeamIdForChallenge !== id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!team) return <div className="text-center py-20 text-gray-500">Team not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{team.name}</h1>
            <p className="text-gray-500">{team.address}</p>
            <p className="text-sm text-gray-400 mt-1">
              Captain: {team.captainName} | {team.memberCount} players
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right space-y-2">
              <ScoreBadge score={team.behaviorScore} label="Behavior" size="lg" />
              <div>
                <SkillBadge
                  level={
                    team.averageSkillLevel < 0.5
                      ? 'Newbie'
                      : team.averageSkillLevel < 1.5
                      ? 'Amateur'
                      : 'SemiPro'
                  }
                />
              </div>
            </div>
            {canChallenge && (
              <button
                onClick={() => setShowChallengeModal(true)}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Challenge
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Matches</h2>
          <div className="space-y-3">
            {upcomingMatches.map((m) => {
              const opponentName = m.teamAId === team.id ? m.teamBName : m.teamAName;
              return (
                <div key={m.id} className="flex justify-between items-center p-4 border border-emerald-100 bg-emerald-50/40 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {team.name} <span className="text-gray-400">vs</span> {opponentName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(m.matchTime).toLocaleString()} · {m.location}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                    m.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {m.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Weekly Schedule */}
      <div className="mb-6">
        <WeeklySchedule
          teamId={team.id}
          slots={schedule}
          canEdit={isCaptainOfThisTeam}
          onChanged={() => id && loadAll(id)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Squad</h2>
              {isCaptainOfThisTeam && (
                <button
                  onClick={loadUsers}
                  className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700"
                >
                  + Invite Player
                </button>
              )}
            </div>
            <div className="space-y-2">
              {team.members.map((m) => (
                <div key={m.userId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {m.name} <span className="text-gray-400">({m.nickname})</span>
                      </p>
                      <p className="text-xs text-gray-500">{m.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkillBadge level={m.skillLevel as 'Newbie' | 'Amateur' | 'SemiPro'} />
                    {m.role === 'Captain' && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        Captain
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Matchmaking Suggestions */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Best Opponents</h2>
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.teamId} className="border border-gray-100 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{s.teamName}</h4>
                  <ConfidenceMeter score={s.score} />
                  <div className="flex gap-2 mt-2">
                    <ScoreBadge score={s.behaviorScore} size="sm" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{s.explanation}</p>
                  <Link
                    to={`/teams/${s.teamId}`}
                    className="mt-3 block text-center bg-emerald-50 text-emerald-700 py-1.5 rounded text-sm font-medium hover:bg-emerald-100"
                  >
                    View Team
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Player Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowInvite(false)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4">Invite Player</h3>
            <div className="space-y-2">
              {allUsers
                .filter((u) => !team.members.some((m) => m.userId === u.id))
                .map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {u.name} ({u.nickname})
                      </p>
                      <p className="text-xs text-gray-500">{u.location}</p>
                    </div>
                    <button
                      onClick={() => handleInvite(u.id)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700"
                    >
                      Invite
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {showChallengeModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowChallengeModal(false)}
        >
          <form
            onSubmit={handleChallenge}
            className="bg-white rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-1">Send Challenge to {team.name}</h3>
            <p className="text-xs text-gray-500 mb-4">Their captain will be notified to accept or reject.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Date & Time</label>
                <input
                  type="datetime-local"
                  value={challengeForm.matchTime}
                  onChange={(e) => setChallengeForm((f) => ({ ...f, matchTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={challengeForm.location}
                  onChange={(e) => setChallengeForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  placeholder="e.g. Sân Thống Nhất"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={challengeForm.message}
                  onChange={(e) => setChallengeForm((f) => ({ ...f, message: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowChallengeModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'Send Challenge'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invitation Sent Popup */}
      {challengeSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">Invitation sent</h3>
            <p className="text-sm text-gray-500 mt-1">
              {team.name}'s captain will be notified.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
