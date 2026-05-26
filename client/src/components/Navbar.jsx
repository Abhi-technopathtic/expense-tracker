import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, LogOut, Menu, X, Wallet, User, TrendingUp
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <div className="logo-icon">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="logo-text">
            Xpense<span className="logo-accent">Pro</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/dashboard" className="nav-link">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
        </div>

        {/* User Section */}
        {user && (
          <div className="navbar-user">
            <div className="user-avatar">
              <User size={16} />
            </div>
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="mobile-nav-link">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          {user && (
            <button onClick={handleLogout} className="mobile-nav-link logout-mobile">
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
