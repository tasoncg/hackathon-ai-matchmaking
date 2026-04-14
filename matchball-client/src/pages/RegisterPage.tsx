import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', nickname: '', email: '', password: '',
    skillLevel: 0, position: 0, role: 0,
    age: 25, location: 'HCMC', latitude: 10.7769, longitude: 106.7009,
    availability: '["Sat 18:00-20:00","Sun 08:00-10:00"]', experienceYears: 2,
  });
  const [error, setError] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch {
      setError('Registration failed. Email may already be taken.');
    }
  };

  const update = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-600 mb-2">Join MatchBall</h1>
          <p className="text-gray-500">Create your player profile</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
              <input type="text" value={form.nickname} onChange={e => update('nickname', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select value={form.position} onChange={e => update('position', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value={0}>GK</option>
                <option value={1}>DF</option>
                <option value={2}>MF</option>
                <option value={3}>FW</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
              <select value={form.skillLevel} onChange={e => update('skillLevel', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value={0}>Newbie</option>
                <option value={1}>Amateur</option>
                <option value={2}>Semi-Pro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input type="number" value={form.age} onChange={e => update('age', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min={10} max={60} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={e => update('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input type="number" value={form.experienceYears} onChange={e => update('experienceYears', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" min={0} max={30} />
            </div>
          </div>
          <button type="submit" disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50">
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-emerald-600 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
