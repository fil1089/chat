import React, { useEffect, useState } from 'react';
import './BackgroundEffects.css';

const BackgroundEffects: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (opacity === 0) setOpacity(1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [opacity]);

  return (
    <div className="background-effects">
      <div className="ambient-glow">
        <div className="glow-spot glow-spot-1"></div>
        <div className="glow-spot glow-spot-2"></div>
      </div>
      <div className="grid-overlay"></div>
      <div 
        className="cursor-glow"
        style={{ 
          left: `${mousePos.x}px`, 
          top: `${mousePos.y}px`,
          opacity: opacity
        }}
      ></div>
      <div className="vignette-overlay"></div>
    </div>
  );
};

export default BackgroundEffects;
