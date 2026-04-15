import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { teamsApi, matchmakingApi, matchesApi } from '../services/api';
import type { Team, MatchSuggestion, Match } from '../types';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';
import ConfidenceMeter from '../components/ConfidenceMeter';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [finding, setFinding] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: teams } = await teamsApi.getMy();
        setMyTeams(teams);
        if (teams.length > 0) {
          setSelectedTeam(teams[0].id);
          const { data } = await matchesApi.getByTeam(teams[0].id);
          setRecentMatches(data.slice(0, 5));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleTeamChange = async (teamId: string) => {
    setSelectedTeam(teamId);
    setSuggestions([]);
    setHasFetched(false);
    try {
      const { data } = await matchesApi.getByTeam(teamId);
      setRecentMatches(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const handleFindMatch = async () => {
    if (!selectedTeam) return;
    setFinding(true);
    setSuggestions([]);
    try {
      const { data } = await matchmakingApi.getBestMatches(selectedTeam);
      setSuggestions(data);
      setHasFetched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFinding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.nickname || user?.name}!
        </h1>
        <p className="text-gray-500 mt-1">Here's your matchmaking dashboard</p>
      </div>

      {/* Team selector + Find Match button */}
      {myTeams.length > 0 && (
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Active Team:</label>
            <select
              value={selectedTeam}
              onChange={(e) => handleTeamChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              {myTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleFindMatch}
            disabled={finding}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-60"
          >
            {finding ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                Find Match
              </>
            )}
          </button>
        </div>
      )}

      {myTeams.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-center">
          <p className="text-yellow-800 font-medium">You're not part of any team yet!</p>
          <Link to="/teams" className="inline-block mt-3 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">
            Create or Join a Team
          </Link>
        </div>
      )}

      {/* Top 3 Suggested Opponents — only shown after Find Match is clicked */}
      {hasFetched && suggestions.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center mb-8">
          <p className="text-gray-500">No suitable opponents found. Try again later.</p>
        </div>
      )}

      {hasFetched && suggestions.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Suggested Opponents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((s, i) => (
              <div key={s.teamId} className={`bg-white rounded-xl border-2 p-6 transition hover:shadow-lg ${
                i === 0 ? 'border-emerald-300 shadow-md' : 'border-gray-200'
              }`}>
                {i === 0 && (
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full mb-3">
                    BEST MATCH
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.teamName}</h3>
                <div className="space-y-3">
                  <ConfidenceMeter score={s.score} />
                  <div className="flex items-center gap-3">
                    <ScoreBadge score={s.behaviorScore} label="Behavior" size="sm" />
                    <SkillBadge level={s.averageSkillLevel < 0.5 ? 'Newbie' : s.averageSkillLevel < 1.5 ? 'Amateur' : 'SemiPro'} />
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{s.explanation}</p>
                  <Link
                    to={`/teams/${s.teamId}`}
                    className="inline-block w-full text-center bg-emerald-50 text-emerald-700 py-2 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
                  >
                    View Team & Challenge
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Matches</h2>
            <Link to="/matches" className="text-sm text-emerald-600 hover:underline">View all</Link>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Match</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentMatches.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {m.teamAName} vs {m.teamBName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(m.matchTime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {m.result ? `${m.result.scoreA} - ${m.result.scoreB}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={m.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-blue-100 text-blue-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
