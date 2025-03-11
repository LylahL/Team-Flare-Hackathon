import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Immigration Helper
        </Link>
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={toggleMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/resources" className="nav-links" onClick={toggleMenu}>
              Resources
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/case-tracker" className="nav-links" onClick={toggleMenu}>
              Case Tracker
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/ai-assistant" className="nav-links" onClick={toggleMenu}>
              AI Assistant
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/community" className="nav-links" onClick={toggleMenu}>
              Community
            </Link>
          </li>
        </ul>
        <div className="auth-buttons">
          <Link to="/login" className="login-button">
            Login
          </Link>
          <Link to="/signup" className="signup-button">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

