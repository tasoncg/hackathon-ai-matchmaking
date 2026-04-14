import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamsApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import type { Team } from '../types';
import ScoreBadge from '../components/ScoreBadge';
import SkillBadge from '../components/SkillBadge';

export default function TeamsPage() {
  const { user } = useAuthStore();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', latitude: 10.7769, longitude: 106.7009 });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const { data } = await teamsApi.getAll();
      setTeams(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await teamsApi.create(form);
    setShowCreate(false);
    setForm({ name: '', address: '', latitude: 10.7769, longitude: 106.7009 });
    loadTeams();
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
        >
          + Create Team
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-4">Create New Team</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Team Name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required />
            <input type="text" placeholder="Address" value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" required />
          </div>
          <button type="submit" className="mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
            Create
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Link key={team.id} to={`/teams/${team.id}`}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition block">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
              <ScoreBadge score={team.behaviorScore} size="sm" />
            </div>
            <p className="text-sm text-gray-500 mb-3">{team.address}</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs text-gray-500">{team.memberCount} players</span>
              <SkillBadge level={team.averageSkillLevel < 0.5 ? 'Newbie' : team.averageSkillLevel < 1.5 ? 'Amateur' : 'SemiPro'} />
            </div>
            <p className="text-xs text-gray-400">Captain: {team.captainName}</p>
            {team.captainId === user?.id && (
              <span className="inline-block mt-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Your Team</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
