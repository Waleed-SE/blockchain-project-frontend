import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const primaryNav = [
    { name: 'Dashboard', path: '/', icon: '🏠' },
    { name: 'Wallet', path: '/wallet', icon: '💰' },
    { name: 'Send Money', path: '/send', icon: '📤' },
    { name: 'History', path: '/history', icon: '📋' },
  ];

  const secondaryNav = [
    { name: 'Beneficiaries', path: '/beneficiaries', icon: '👥' },
    { name: 'Mining', path: '/mining', icon: '⛏️' },
    { name: 'Blocks', path: '/blocks', icon: '🔗' },
    { name: 'Validate', path: '/validate', icon: '✅' },
    { name: 'Reports', path: '/reports', icon: '📊' },
    { name: 'Logs', path: '/logs', icon: '📝' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo & Primary Nav */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-xl sm:text-2xl font-bold text-primary whitespace-nowrap">🔗 BlockWallet</h1>
              </Link>
              
              {/* Primary Navigation - Always visible on desktop */}
              <div className="hidden lg:flex space-x-6">
                {primaryNav.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'text-primary border-primary'
                        : 'text-gray-600 border-transparent hover:text-primary hover:border-gray-300'
                    } inline-flex items-center px-2 py-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <span className="mr-1.5">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
                
                {/* More Menu Dropdown */}
                <div className="relative group">
                  <button className="text-gray-600 hover:text-primary inline-flex items-center px-2 py-1 text-sm font-medium transition-colors">
                    <span className="mr-1.5">⋯</span>
                    More
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {secondaryNav.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`${
                          location.pathname === item.path
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 hover:bg-gray-50'
                        } flex items-center px-4 py-2.5 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg`}
                      >
                        <span className="mr-2 text-base">{item.icon}</span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: User Info & Logout */}
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sm text-gray-700 truncate max-w-[200px]">
                {user?.email}
              </span>
              <button
                onClick={logout}
                className="btn-primary text-sm px-4 py-2 whitespace-nowrap"
              >
                Logout
              </button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-gray-600 hover:text-primary p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {[...primaryNav, ...secondaryNav].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`${
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary border-l-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent'
                  } flex items-center px-4 py-3 text-sm font-medium transition-colors rounded`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white mt-12 border-t">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Blockchain Wallet System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
