import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const isLoggedIn = false;

  return (
    <nav className="navbar">
      <div className="navbar-brand">HelperBot</div>
      <div className="navbar-links">
        {isLoggedIn ? (
          <div className="user-profile">
            <img src="path/to/profile/icon" alt="Profile" />
          </div>
        ) : (
          <>
            <Link to="/login"></Link>
            <Link to="/register"></Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
