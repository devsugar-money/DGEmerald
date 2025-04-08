import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BadgeHelp as Help, 
  Book, 
  Settings,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    return currentPath === path ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-5">
          <h1 className="text-xl font-bold flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2" /> Admin Panel
          </h1>
        </div>
        <nav className="mt-4">
          <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Hint Resources
          </div>
          <Link 
            to="/admin/hint-titles" 
            className={`flex items-center px-4 py-3 text-sm ${isActive('/admin/hint-titles')}`}
          >
            <Help className="h-4 w-4 mr-3" />
            <span>Hint Titles</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>
          <Link 
            to="/admin/hint-contents" 
            className={`flex items-center px-4 py-3 text-sm ${isActive('/admin/hint-contents')}`}
          >
            <Help className="h-4 w-4 mr-3" />
            <span>Hint Contents</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>

          <div className="px-4 pt-5 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Learn Resources
          </div>
          <Link 
            to="/admin/learn-titles" 
            className={`flex items-center px-4 py-3 text-sm ${isActive('/admin/learn-titles')}`}
          >
            <Book className="h-4 w-4 mr-3" />
            <span>Learn Titles</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>
          <Link 
            to="/admin/learn-contents" 
            className={`flex items-center px-4 py-3 text-sm ${isActive('/admin/learn-contents')}`}
          >
            <Book className="h-4 w-4 mr-3" />
            <span>Learn Contents</span>
            <ChevronRight className="h-4 w-4 ml-auto" />
          </Link>

          <div className="mt-6 px-4">
            <Link 
              to="/dashboard" 
              className="flex items-center px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-md"
            >
              Back to Dashboard
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
