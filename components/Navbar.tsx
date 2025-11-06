import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-800 p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to={user ? '/dashboard' : '/'} className="text-white text-2xl font-bold tracking-wide">
          Student Election System
        </NavLink>
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <>
                  <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) =>
                      `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                        isActive ? 'underline' : ''
                      }`
                    }
                  >
                    Admin Dashboard
                  </NavLink>
                  <NavLink
                    to="/applications"
                    className={({ isActive }) =>
                      `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                        isActive ? 'underline' : ''
                      }`
                    }
                  >
                    Applications
                  </NavLink>
                </>
              )}
              {user.role === UserRole.STUDENT && (
                <>
                  <NavLink
                    to="/student-dashboard"
                    className={({ isActive }) =>
                      `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                        isActive ? 'underline' : ''
                      }`
                    }
                  >
                    Student Dashboard
                  </NavLink>
                </>
              )}
              <NavLink
                to="/elections"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                    isActive ? 'underline' : ''
                  }`
                }
              >
                Elections
              </NavLink>
              {user.role === UserRole.ADMIN && ( // Only admin needs to manage QR codes
                <NavLink
                  to="/qr-codes"
                  className={({ isActive }) =>
                    `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                      isActive ? 'underline' : ''
                    }`
                  }
                >
                  QR Codes
                </NavLink>
              )}
              <NavLink
                to="/results"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                    isActive ? 'underline' : ''
                  }`
                }
              >
                Results
              </NavLink>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-colors duration-200 hover:text-blue-200 ${
                    isActive ? 'underline' : ''
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-blue-700' : ''
                  }`
                }
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-green-700' : ''
                  }`
                }
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;