import { useEffect, useState } from 'react';
import { teamsApi, matchesApi } from '../services/api';
import type { Team, Match } from '../types';
import { useAuthStore } from '../stores/authStore';

export default function MatchesPage() {
  const { user } = useAuthStore();
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [resultForm, setResultForm] = useState<{ matchId: string; scoreA: number; scoreB: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: teams } = await teamsApi.getMy();
      setMyTeams(teams);
      if (teams.length > 0) {
        setSelectedTeam(teams[0].id);
        const { data } = await matchesApi.getByTeam(teams[0].id);
        setMatches(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleTeamChange = async (teamId: string) => {
    setSelectedTeam(teamId);
    const { data } = await matchesApi.getByTeam(teamId);
    setMatches(data);
  };

  const handleConfirm = async (matchId: string) => {
    await matchesApi.confirm(matchId);
    handleTeamChange(selectedTeam);
  };

  const handleCancel = async (matchId: string) => {
    await matchesApi.cancel(matchId);
    handleTeamChange(selectedTeam);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultForm) return;
    await matchesApi.submitResult(resultForm.matchId, resultForm.scoreA, resultForm.scoreB);
    setResultForm(null);
    handleTeamChange(selectedTeam);
  };

  const handleConfirmResult = async (matchId: string) => {
    await matchesApi.confirmResult(matchId);
    handleTeamChange(selectedTeam);
  };

  const getMyTeam = () => myTeams.find(t => t.id === selectedTeam);
  const isCaptainOf = (teamId: string) => myTeams.find(t => t.id === teamId)?.captainId === user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Match History</h1>

      {myTeams.length > 0 && (
        <div className="mb-6">
          <select value={selectedTeam} onChange={e => handleTeamChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
            {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {matches.map(m => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-bold text-gray-900">{m.teamAName}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="text-lg font-bold text-gray-900">{m.teamBName}</span>
                </div>
                <p className="text-sm text-gray-500">{new Date(m.matchTime).toLocaleString()}</p>
                <p className="text-sm text-gray-500">{m.location} {m.fieldName && `@ ${m.fieldName}`}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={m.status} />
                {m.result && (
                  <p className="text-2xl font-bold mt-2">
                    {m.result.scoreA} - {m.result.scoreB}
                    {m.result.confirmed && <span className="text-xs text-green-600 ml-2">Confirmed</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {m.status === 'Pending' && isCaptainOf(m.teamBId) && (
                <>
                  <button onClick={() => handleConfirm(m.id)}
                    className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">Accept</button>
                  <button onClick={() => handleCancel(m.id)}
                    className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-700">Decline</button>
                </>
              )}
              {m.status === 'Confirmed' && !m.result && (isCaptainOf(m.teamAId) || isCaptainOf(m.teamBId)) && (
                <button onClick={() => setResultForm({ matchId: m.id, scoreA: 0, scoreB: 0 })}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Submit Result</button>
              )}
              {m.result && !m.result.confirmed && (isCaptainOf(m.teamAId) || isCaptainOf(m.teamBId)) && (
                <button onClick={() => handleConfirmResult(m.id)}
                  className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700">Confirm Result</button>
              )}
            </div>
          </div>
        ))}
        {matches.length === 0 && (
          <p className="text-center text-gray-500 py-12">No matches yet</p>
        )}
      </div>

      {/* Result submission modal */}
      {resultForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setResultForm(null)}>
          <form onSubmit={handleSubmitResult} className="bg-white rounded-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Submit Match Result</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Team A Score</label>
                <input type="number" min={0} max={99} value={resultForm.scoreA}
                  onChange={e => setResultForm(f => f ? { ...f, scoreA: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Team B Score</label>
                <input type="number" min={0} max={99} value={resultForm.scoreB}
                  onChange={e => setResultForm(f => f ? { ...f, scoreB: Number(e.target.value) } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-xl" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setResultForm(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium">Submit</button>
            </div>
          </form>
        </div>
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
