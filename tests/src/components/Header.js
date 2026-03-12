import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Header.css';
import Logo from '../assets/images/pasiglogowhite.png';

const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rightRef = useRef(null);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      localStorage.clear();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfile = () => {
    navigate('/profile');
    setOpen(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (rightRef.current && !rightRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  return (
    <header className="app-header">
     <div className="header-left">
  <div className="logo-wrap">
    <img src={Logo} alt="Pasig Logo" className="logo" />
  </div>
  {/* optional text */}
</div>

      <div className="header-right" ref={rightRef}>
        <div
          className="user-menu"
          onClick={() => setOpen(!open)}
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ' ? setOpen((v) => !v) : null)}
          aria-haspopup="menu"
          aria-expanded={open}
        >
          Welcome, <strong>User</strong>
          <span className="triangle">▾</span>
        </div>

        {open && (
          <div className="dropdown" role="menu">
            <button onClick={handleProfile}>Profile</button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;