import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleExport = async () => {
    try {
      const response = await api.get('/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lifetracker-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/goals', label: 'Goals' },
    { path: '/calendar', label: 'Calendar' },
    { path: '/insights', label: 'Insights' },
  ];

  return (
    <div className="min-h-screen bg-primary-bg">
      {/* Header */}
      <header className="bg-primary-text text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">LifeTracker</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline">{user?.email}</span>
              <button
                onClick={handleExport}
                className="px-3 py-1 text-sm bg-accent hover:bg-hover-bg hover:text-primary-text rounded transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-secondary-text hover:bg-accent rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-divider">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                  location.pathname === link.path
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
