import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// This is a temporary component to help debug navigation issues
const TempNavDebug: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, userRole, user } = useAuthStore();
  
  const navigateToRoute = (route: string) => {
    console.log(`Navigating to ${route}`);
    navigate(route);
  };
  
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#f0f0f0',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 9999,
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Debug Navigation</h3>
      <div style={{ fontSize: '12px', marginBottom: '10px' }}>
        <div>User: {user?.email || 'Not logged in'}</div>
        <div>Role: {userRole || 'None'}</div>
        <div>Admin: {isAdmin ? 'Yes' : 'No'}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button 
          onClick={() => navigateToRoute('/admin/resources')}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#4F46E5', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Direct to Admin Resources
        </button>
        <button 
          onClick={() => window.location.href = '/admin/resources'}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#10B981', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Bypass Router to Admin
        </button>
        <button 
          onClick={() => navigateToRoute('/dashboard')}
          style={{ 
            padding: '8px 12px', 
            backgroundColor: '#F59E0B', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default TempNavDebug;
