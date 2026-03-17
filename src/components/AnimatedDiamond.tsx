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
            duration: 8, // Slower rotation for premium feel
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
        color: isGlow ? "rgba(255, 255, 255, 0.95)" : "var(--accent)"
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
          {/* Sphere Gradient */}
          <radialGradient id="sphereGradient" cx="40%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" /> {/* Light purple/lavender highlight */}
            <stop offset="40%" stopColor="#8b5cf6" /> {/* Main purple */}
            <stop offset="100%" stopColor="#3b82f6" /> {/* Outer blue */}
          </radialGradient>

          {/* Soft Glow Filter */}
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Background Spread Glow */}
          <filter id="spreadGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.4  0 0 0 0 1  0 0 0 1 0" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Diamond Frame */}
        <motion.path
          d="M12 2L2 12l10 10 10-10L12 2z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            filter: isGlow ? "drop-shadow(0 0 2px rgba(255,255,255,0.3))" : "none"
          }}
        />

        {/* Glowing Sphere */}
        <motion.circle
          cx="12"
          cy="12"
          r="4.8"
          fill="url(#sphereGradient)"
          animate={isGlow ? {
            scale: [0.9, 1.1, 0.9],
            opacity: [0.9, 1, 0.9]
          } : {}}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
          style={{ 
            transformOrigin: "center", 
            transformBox: "fill-box",
            filter: isGlow ? "url(#spreadGlow)" : "none"
          }}
        />
      </svg>
    </motion.div>
  );
}
