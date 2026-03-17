import React, { useRef, useState } from 'react';

interface CardGlowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onTouchStart?: () => void;
  onTouchEnd?: () => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnter?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

const CardGlow: React.FC<CardGlowProps> = ({ 
  children, 
  className = '', 
  style = {},
  ...props 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={cardRef}
      className={`card-glow-container ${className}`}
      onMouseMove={handleMouseMove}
      style={{
        ...style,
        '--mouse-x': `${position.x}px`,
        '--mouse-y': `${position.y}px`,
      } as React.CSSProperties}
      {...props}
    >
      <div className="card-glow-effect"></div>
      {children}
    </div>
  );
};

export default CardGlow;
