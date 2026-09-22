import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const Navbar = ({ isPlaying, togglePlay }) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleFooterVisible = (e) => {
      setIsHidden(e.detail);
    };
    window.addEventListener('footer-visible', handleFooterVisible);
    return () => {
      window.removeEventListener('footer-visible', handleFooterVisible);
    };
  }, []);

  return (
    <nav className="glass" style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: isHidden ? 'translate(-50%, -150%)' : 'translate(-50%, 0)',
      opacity: isHidden ? 0 : 1,
      transition: 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out',
      width: '80%',
      maxWidth: '1000px',
      borderRadius: '50px',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2.5rem',
      backgroundColor: 'rgba(11, 15, 25, 0.15)', // Extra transparency for navbar
      pointerEvents: isHidden ? 'none' : 'auto'
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
        YOUR VERSE
      </div>
      <ul style={{
        display: 'flex',
        listStyle: 'none',
        gap: '2rem',
        fontSize: '1rem',
        alignItems: 'center',
        margin: 0,
        padding: 0
      }}>
        <li style={{ cursor: 'pointer' }}><Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link></li>
        <li style={{ cursor: 'pointer' }}><Link to="/explore" style={{ color: 'inherit', textDecoration: 'none' }}>Explore</Link></li>
        <li style={{ cursor: 'pointer' }}><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</Link></li>
        
        {/* Music Button */}
        <li 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '1rem' }} 
          onClick={togglePlay}
          title={isPlaying ? "Mute Music" : "Play Music"}
        >
          {isPlaying ? <FaVolumeUp size={20} /> : <FaVolumeMute size={20} />}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
