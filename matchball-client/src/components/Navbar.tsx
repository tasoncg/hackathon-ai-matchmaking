import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-bold text-emerald-600 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M12 2 C12 2 8 7 8 12 C8 17 12 22 12 22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 2 C12 2 16 7 16 12 C16 17 12 22 12 22" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              MatchBall
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link to="/teams" className="text-sm text-gray-600 hover:text-gray-900">Teams</Link>
                <Link to="/matches" className="text-sm text-gray-600 hover:text-gray-900">Matches</Link>
                <Link to="/fields" className="text-sm text-gray-600 hover:text-gray-900">Fields</Link>
              </div>
            )}
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-sm text-gray-600 hover:text-gray-900">
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
