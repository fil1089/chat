import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  text,
  speed = 50,
  delay = 0,
  className = "",
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let charIndex = 0;

    const startTyping = () => {
      setHasStarted(true);
      const type = () => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(type, speed + Math.random() * 20); // Add slight randomness for "natural" feel
        } else {
          setIsDone(true);
          if (onComplete) onComplete();
        }
      };
      type();
    };

    const initialDelay = setTimeout(startTyping, delay);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(timeout);
    };
  }, [text, speed, delay, onComplete]);

  return (
    <span 
      className={className} 
      style={{ 
        display: 'inline-grid', 
        verticalAlign: 'middle',
        textAlign: 'left',
        position: 'relative'
      }}
    >
      {/* Ghost text to reserve space and prevent horizontal jumping */}
      <span style={{ gridArea: '1/1', visibility: 'hidden', whiteSpace: 'pre-wrap' }}>
        {text}
      </span>
      
      {/* Actual typing text */}
      <span style={{ gridArea: '1/1', whiteSpace: 'pre-wrap', position: 'relative' }}>
        {displayedText}
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            display: "inline-block",
            width: "2px",
            height: "1em",
            backgroundColor: "currentColor",
            marginLeft: "2px",
            verticalAlign: "middle",
            visibility: (isDone || !hasStarted) ? "hidden" : "visible"
          }}
        />
      </span>
    </span>
  );
};
