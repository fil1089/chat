import { motion } from "motion/react";

type AnimationType = "rotate" | "pulse" | "bounce" | "glow" | "spin3d";

interface AnimatedDiamondProps {
  animationType: AnimationType;
  size?: number;
}

export function AnimatedDiamond({ animationType, size = 120 }: AnimatedDiamondProps) {
  const getAnimation = (): any => {
    switch (animationType) {
      case "rotate":
        return {
          rotate: [0, 360],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear" as const
          }
        };
      case "pulse":
        return {
          scale: [1, 1.2, 1],
          opacity: [1, 0.7, 1],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case "bounce":
        return {
          y: [0, -30, 0],
          rotate: [0, 10, -10, 0],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const
          }
        };
      case "glow":
        return {
          rotate: [0, 360],
          transition: {
            duration: 9, // Even slower for elegant rotation
            repeat: Infinity,
            ease: "linear" as const
          }
        };
      case "spin3d":
        return {
          rotateY: [0, 360],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "linear" as const
          }
        };
      default:
        return {};
    }
  };

  const isGlow = animationType === "glow";

  return (
    <motion.div
      animate={getAnimation()}
      style={{
        display: "inline-flex",
        perspective: "1000px",
        color: isGlow ? "rgba(240, 248, 255, 0.95)" : "var(--accent)"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Refined Cold Blue-Purple Gradient */}
          <radialGradient id="sphereGradient" cx="35%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#f0f7ff" /> {/* Light pearl highlight */}
            <stop offset="45%" stopColor="#c7d2fe" /> {/* Soft cold blue-purple */}
            <stop offset="100%" stopColor="#818cf8" /> {/* Deep cold indigo */}
          </radialGradient>

          {/* Cold Spread Glow Filter with soft dissolving edges */}
          <filter id="coldGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="softSource" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            {/* Matrices for cold blue/purple shift */}
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.5  0 0 0 0 1  0 0 0 0.7 0" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="softSource" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Frame - Light with a hint of purple tint */}
        <motion.path
          d="M12 2L2 12l10 10 10-10L12 2z"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            filter: isGlow ? "drop-shadow(0 0 2px rgba(199, 210, 254, 0.4))" : "none"
          }}
        />

        {/* Central Pulse Sphere */}
        <motion.circle
          cx="12"
          cy="12"
          r="4.6"
          fill="url(#sphereGradient)"
          animate={isGlow ? {
            scale: [0.93, 1.07, 0.93],
            opacity: [0.85, 1, 0.85]
          } : {}}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
          style={{ 
            transformOrigin: "center", 
            transformBox: "fill-box",
            filter: isGlow ? "url(#coldGlow)" : "none"
          }}
        />
      </svg>
    </motion.div>
  );
}
