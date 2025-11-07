import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <nav className="bg-blue-900 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <NavLink to={user ? '/dashboard' : '/'} className="text-white text-3xl md:text-4xl font-extrabold tracking-wide hover:text-blue-100 transition-colors duration-200" aria-label="Home">
          Student Elections
        </NavLink>
        <div className="flex items-center space-x-4 sm:space-x-6 mt-3 sm:mt-0">
          {user ? (
            <>
              {user.role === UserRole.ADMIN && (
                <>
                  <NavLink
                    to="/admin-dashboard"
                    className={({ isActive }) =>
                      `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                        isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                      }`
                    }
                    aria-label="Admin Dashboard"
                  >
                    Admin Dashboard
                  </NavLink>
                  <NavLink
                    to="/applications"
                    className={({ isActive }) =>
                      `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                        isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                      }`
                    }
                    aria-label="Applications"
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
                      `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                        isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                      }`
                    }
                    aria-label="Student Dashboard"
                  >
                    Student Dashboard
                  </NavLink>
                </>
              )}
              <NavLink
                to="/elections"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                    isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                  }`
                }
                aria-label="Elections"
              >
                Elections
              </NavLink>
              {user.role === UserRole.ADMIN && ( // Only admin needs to manage QR codes
                <NavLink
                  to="/qr-codes"
                  className={({ isActive }) =>
                    `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                        isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                    }`
                  }
                  aria-label="QR Codes"
                >
                  QR Codes
                </NavLink>
              )}
              <NavLink
                to="/results"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                    isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                  }`
                }
                aria-label="Results"
              >
                Results
              </NavLink>
              <span className="text-blue-200 text-lg font-semibold ml-4 hidden md:inline-block">
                Hello, {user.username}!
              </span>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-5 rounded-full transition-colors duration-200 shadow-md"
                aria-label="Logout"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `text-white text-lg font-medium transition-all duration-200 hover:text-blue-200 relative group ${
                    isActive ? 'after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-blue-200' : 'after:absolute after:bottom-[-4px] after:left-0 after:w-0 group-hover:after:w-full after:h-0.5 after:bg-blue-200 after:transition-all after:duration-300'
                  }`
                }
                aria-label="Home"
              >
                Home
              </NavLink>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-full transition-colors duration-200 shadow-md ${
                    isActive ? 'bg-blue-700' : ''
                  }`
                }
                aria-label="Login"
              >
                Login
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-full transition-colors duration-200 shadow-md ${
                    isActive ? 'bg-green-700' : ''
                  }`
                }
                aria-label="Register"
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