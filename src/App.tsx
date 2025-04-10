import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';

function App() {
  const { checkSession, loading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check if the user is already logged in
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className={isLandingPage ? "flex-grow w-full p-0 m-0" : "flex-grow px-4 py-8"}>
        <Outlet />
      </main>
      {!isLandingPage && (
        <footer className="bg-primary-800 text-white py-4">
          <div className="container mx-auto px-4 text-center">
            <p>DecisionTree Builder &copy; {new Date().getFullYear()}</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;