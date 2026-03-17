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
          filter: [
            "drop-shadow(0 0 2px var(--accent))",
            "drop-shadow(0 0 20px var(--accent))",
            "drop-shadow(0 0 2px var(--accent))"
          ],
          transition: {
            rotate: {
              duration: 3,
              repeat: Infinity,
              ease: "linear" as const
            },
            filter: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" as const
            }
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

  return (
    <motion.div
      animate={getAnimation()}
      style={{
        display: "inline-flex",
        perspective: "1000px",
        color: "var(--accent)"
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          d="M12 2L2 12l10 10 10-10L12 2z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut" as const
          }}
        />
        <motion.path
          d="M12 6l-6 6 6 6 6-6-6-6z"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 2,
            delay: 0.3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut" as const
          }}
        />
      </svg>
    </motion.div>
  );
}
