import { useAuthStore } from '../stores/authStore';
import SkillBadge from '../components/SkillBadge';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Goalkeeper', DF: 'Defender', MF: 'Midfielder', FW: 'Forward',
};

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  let availability: string[] = [];
  try {
    availability = JSON.parse(user.availability);
  } catch { /* empty */ }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-700">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500">@{user.nickname}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard label="Position" value={POSITION_LABELS[user.position] || user.position} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Skill Level</label>
            <SkillBadge level={user.skillLevel} />
          </div>
          <InfoCard label="Age" value={String(user.age)} />
          <InfoCard label="Experience" value={`${user.experienceYears} years`} />
          <InfoCard label="Location" value={user.location} />
          <InfoCard label="Role" value={user.role} />
        </div>

        {availability.length > 0 && (
          <div className="mt-6">
            <label className="block text-xs text-gray-500 mb-2">Weekly Availability</label>
            <div className="flex flex-wrap gap-2">
              {availability.map((slot, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
