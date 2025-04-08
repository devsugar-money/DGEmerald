import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Trees } from './IconProvider';

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Trees className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-800">DecideGuide</span>
        </Link>
        
        <div className="space-x-4">
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin/resources" 
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Admin Resources
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;