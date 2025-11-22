import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>📦 Inventory Management</h2>
      </div>
      
      {user && (
        <div className="navbar-user">
          <span className="user-name">👤 {user.username}</span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


