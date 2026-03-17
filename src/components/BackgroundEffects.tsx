import { useEffect, useState } from "react";

export function BackgroundEffects() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0
      }} 
    >
      {/* Gradient following cursor */}
      <div
        style={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '9999px',
          filter: 'blur(120px)',
          opacity: 0.2,
          transitionProperty: 'all',
          transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
          transitionDuration: '300ms',
          background: "radial-gradient(circle, #7B5CFF 0%, transparent 70%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      />

      {/* Static ambient glows */}
      <div 
        style={{ 
          position: 'absolute',
          top: 0,
          left: '25%',
          width: '500px',
          height: '500px',
          borderRadius: '9999px',
          backgroundColor: '#7B5CFF',
          filter: 'blur(150px)',
          opacity: 0.1,
          animation: 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
      <div 
        style={{ 
          position: 'absolute',
          bottom: '25%',
          right: '25%',
          width: '400px',
          height: '400px',
          borderRadius: '9999px',
          backgroundColor: '#4DA3FF',
          filter: 'blur(130px)',
          opacity: 0.1,
          animation: 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          animationDelay: '2s'
        }}
      />
      
      {/* Grid overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: 0.02,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Vignette */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          background: 'radial-gradient(circle at center, transparent 0%, rgba(11,11,15,0.4) 100%)',
        }}
      />
    </div>
  );
}
