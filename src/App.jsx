import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollSequence from './components/ScrollSequence';
import About from './components/About';
import Explore from './components/Explore';
import musicFile from '../videoplayback.weba';

function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Attempt to play, catch potential autoplay restrictions
        audioRef.current.play().catch(error => {
          console.error("Audio playback failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, []);

  return (
    <BrowserRouter>
      {/* Hidden audio element that plays across all routes */}
      <audio ref={audioRef} src={musicFile} loop />

      <Navbar isPlaying={isPlaying} togglePlay={togglePlay} />
      <Routes>
        <Route path="/" element={<ScrollSequence />} />
        <Route path="/explore" element={<Explore isPlaying={isPlaying} togglePlay={togglePlay} />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
