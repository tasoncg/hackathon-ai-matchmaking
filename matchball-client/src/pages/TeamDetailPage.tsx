import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teamsApi, matchmakingApi, matchesApi, usersApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Team, MatchSuggestion, User } from '../types';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [team, setTeam] = useState<Team | null>(null);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [challengeTeam, setChallengeTeam] = useState<string | null>(null);
  const [matchForm, setMatchForm] = useState({ matchTime: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) loadTeam(id);
  }, [id]);

  const loadTeam = async (teamId: string) => {
    try {
      const [teamRes, sugRes] = await Promise.all([
        teamsApi.getById(teamId),
        matchmakingApi.getBestMatches(teamId, 5),
      ]);
      setTeam(teamRes.data);
      setSuggestions(sugRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (userId: string) => {
    if (!id) return;
    try {
      await teamsApi.invite(id, userId);
      loadTeam(id);
      setShowInvite(false);
    } catch (err) {
      alert('Failed to invite player');
    }
  };

  const handleChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !challengeTeam) return;
    try {
      await matchesApi.create({
        teamAId: id,
        teamBId: challengeTeam,
        matchTime: new Date(matchForm.matchTime).toISOString(),
        location: matchForm.location,
      });
      setChallengeTeam(null);
      alert('Match invitation sent!');
    } catch {
      alert('Failed to create match');
    }
  };

  const loadUsers = async () => {
    const { data } = await usersApi.getAll();
    setAllUsers(data);
    setShowInvite(true);
  };

  const isCaptain = team?.captainId === user?.id;

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{team.name}</h1>
            <p className="text-gray-500">{team.address}</p>
            <p className="text-sm text-gray-400 mt-1">Captain: {team.captainName} | {team.memberCount} players</p>
          </div>
          <div className="text-right space-y-2">
            <ScoreBadge score={team.behaviorScore} label="Behavior" size="lg" />
            <div>
              <SkillBadge level={team.averageSkillLevel < 0.5 ? 'Newbie' : team.averageSkillLevel < 1.5 ? 'Amateur' : 'SemiPro'} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Squad</h2>
              {isCaptain && (
                <button onClick={loadUsers} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-700">
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
                      <p className="text-sm font-medium text-gray-900">{m.name} <span className="text-gray-400">({m.nickname})</span></p>
                      <p className="text-xs text-gray-500">{m.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SkillBadge level={m.skillLevel} />
                    {m.role === 'Captain' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Captain</span>}
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
                  {isCaptain && (
                    <button
                      onClick={() => setChallengeTeam(s.teamId)}
                      className="mt-3 w-full bg-emerald-50 text-emerald-700 py-1.5 rounded text-sm font-medium hover:bg-emerald-100"
                    >
                      Challenge
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInvite(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Invite Player</h3>
            <div className="space-y-2">
              {allUsers
                .filter(u => !team.members.some(m => m.userId === u.id))
                .map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div>
                      <p className="text-sm font-medium">{u.name} ({u.nickname})</p>
                      <p className="text-xs text-gray-500">{u.location}</p>
                    </div>
                    <button onClick={() => handleInvite(u.id)}
                      className="bg-emerald-600 text-white px-3 py-1 rounded text-xs hover:bg-emerald-700">
                      Invite
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {challengeTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setChallengeTeam(null)}>
          <form onSubmit={handleChallenge} className="bg-white rounded-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Send Match Challenge</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Match Date & Time</label>
                <input type="datetime-local" value={matchForm.matchTime}
                  onChange={e => setMatchForm(f => ({ ...f, matchTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={matchForm.location}
                  onChange={e => setMatchForm(f => ({ ...f, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="e.g. District 7 Field" required />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setChallengeTeam(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">Send Challenge</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
