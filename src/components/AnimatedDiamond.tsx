import { motion } from "motion/react";
import { useApp } from "../context/AppContext";

type AnimationType = "rotate" | "pulse" | "bounce" | "glow" | "spin3d";

interface AnimatedDiamondProps {
  animationType: AnimationType;
  size?: number;
  animateOnHover?: boolean;
}

export function AnimatedDiamond({ animationType, size = 120, animateOnHover = false }: AnimatedDiamondProps) {
  const { state } = useApp();
  const settings = state.settings.logoSettings || {
    frameBlur: 0.1,
    sphereBlur: 0.8,
    glowStrength: 3.5,
    primaryColor: '#f0f7ff',
    secondaryColor: '#c7d2fe',
    accentColor: '#818cf8',
    frameColor: '#e0e7ff',
  };

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
        return {};
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
  
  // Variants for coordinated animation
  const containerVariants = {
    animate: getAnimation(),
  };

  const sphereVariants = {
    animate: isGlow ? {
      scale: [0.93, 1.07, 0.93],
      opacity: [0.85, 1, 0.85],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    } : {}
  };

  return (
    <motion.div
      variants={containerVariants}
      animate={!animateOnHover ? "animate" : undefined}
      whileHover={animateOnHover ? "animate" : undefined}
      style={{
        display: "inline-flex",
        perspective: "1000px",
        color: isGlow ? settings.frameColor : "var(--accent)"
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
          <radialGradient id="sphereGradient" cx="35%" cy="35%" r="55%">
            <stop offset="0%" stopColor={settings.primaryColor} /> 
            <stop offset="45%" stopColor={settings.secondaryColor} />
            <stop offset="100%" stopColor={settings.accentColor} />
          </radialGradient>

          <filter id="coldGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={settings.sphereBlur} result="softSource" />
            <feGaussianBlur in="SourceGraphic" stdDeviation={settings.glowStrength} result="blur" />
            <feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.4  0 0 0 0 0.5  0 0 0 0 1  0 0 0 0.7 0" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="softSource" />
            </feMerge>
          </filter>
          <filter id="frameBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={settings.frameBlur} />
          </filter>
        </defs>

        <motion.rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ 
            transform: "rotate(45deg)",
            transformOrigin: "center",
            filter: isGlow && settings.frameBlur > 0 ? `url(#frameBlur) drop-shadow(0 0 2px rgba(199, 210, 254, 0.4))` : (isGlow ? "drop-shadow(0 0 2px rgba(199, 210, 254, 0.4))" : "none")
          }}
        />

        <motion.circle
          cx="12"
          cy="12"
          r="4.2"
          fill="url(#sphereGradient)"
          variants={sphereVariants}
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
