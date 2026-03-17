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
            duration: 4,
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
        color: isGlow ? "rgba(255, 255, 255, 0.85)" : "var(--accent)"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ overflow: 'visible' }}
      >
        <motion.path
          d="M12 2L2 12l10 10 10-10L12 2z"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="4.5"
          fill="var(--accent)"
          stroke="none"
          animate={{
            scale: [0.8, 1.15, 0.8],
            filter: isGlow ? [
              "drop-shadow(0 0 2px var(--accent))",
              "drop-shadow(0 0 12px var(--accent))",
              "drop-shadow(0 0 2px var(--accent))"
            ] : "none"
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut" as const
          }}
          style={{ transformOrigin: "center", transformBox: "fill-box" }}
        />
      </svg>
    </motion.div>
  );
}
