import { useState } from 'react';
import { Menu, X, LayoutDashboard, User, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';  // Adjust path as needed

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isAuthenticated, userType } = useSelector((state: RootState) => state.auth);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const dashboardLink =
    userType === 'admin' ? '/admin-dashboard' :
    userType === 'doctor' ? '/doctor-dashboard' :
    '/user-dashboard';

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-blue-600">
              <Link to="/">MediTime</Link>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link to="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Contact</Link>
              <Link to="/browse-doctors" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Browse Doctors</Link>
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                  <User size={16} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center space-x-1">
                  <UserPlus size={16} />
                  <span>Register</span>
                </Link>
              </>
            ) : (
              <Link to={dashboardLink} className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-blue-600 focus:outline-none">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">About</Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Contact</Link>
            <Link to="/browse-doctors" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">Browse Doctors</Link>

            <div className="pt-3 border-t border-gray-200 mt-2">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">
                    <User size={16} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-700 mt-2">
                    <UserPlus size={16} />
                    <span>Register</span>
                  </Link>
                </>
              ) : (
                <Link to={dashboardLink} className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600">
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
