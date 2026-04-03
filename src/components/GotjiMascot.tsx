import { motion } from "framer-motion";

export type Mood = "Happy" | "Sad" | "Angry" | "Neutral";

interface GotjiMascotProps {
  mood: Mood;
  onClick?: () => void;
}

export const GotjiMascot = ({ mood, onClick }: GotjiMascotProps) => {
  // Different face/colors based on mood
  const colors = {
    Happy: "#4ade80", // Green
    Sad: "#60a5fa", // Blue
    Angry: "#f87171", // Red
    Neutral: "#34d399", // Emerald
  };

  const currentColor = colors[mood] || colors.Neutral;

  return (
    <motion.div
      className="cursor-pointer drop-shadow-2xl hover:drop-shadow-xl transition-all"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -10, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
    >
      <svg width="150" height="150" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Dinosaur Body */}
        <motion.path 
          d="M 50 150 C 50 80, 80 40, 110 40 C 140 40, 160 80, 160 150 C 160 180, 50 180, 50 150 Z" 
          fill={currentColor} 
          animate={{ fill: currentColor }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Back Spikes */}
        <path d="M 65 60 L 35 40 L 75 80 Z" fill="#065f46" />
        <path d="M 100 35 L 90 5 L 120 45 Z" fill="#065f46" />
        <path d="M 140 55 L 165 30 L 140 85 Z" fill="#065f46" />

        {/* Belly */}
        <path d="M 80 150 C 80 110, 100 100, 130 110 C 140 140, 130 180, 80 180 C 60 180, 60 160, 80 150 Z" fill="#ecfdf5" opacity="0.6"/>

        {/* Emotion Features */}
        {mood === "Happy" && (
          <g>
            {/* Happy Eyes */}
            <path d="M 90 90 Q 100 80 110 90" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 130 90 Q 140 80 150 90" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Happy Mouth */}
            <path d="M 100 120 Q 120 140 140 120" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Blush */}
            <circle cx="85" cy="110" r="8" fill="#fca5a5" opacity="0.8" />
            <circle cx="155" cy="110" r="8" fill="#fca5a5" opacity="0.8" />
          </g>
        )}

        {mood === "Neutral" && (
          <g>
            <circle cx="100" cy="90" r="6" fill="#1f2937" />
            <circle cx="140" cy="90" r="6" fill="#1f2937" />
            <path d="M 110 120 L 130 120" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {mood === "Sad" && (
          <g>
            <path d="M 90 90 Q 100 85 110 95" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 130 95 Q 140 85 150 90" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 105 130 Q 120 115 135 130" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Tears */}
            <circle cx="95" cy="110" r="4" fill="#3b82f6" />
            <circle cx="145" cy="110" r="4" fill="#3b82f6" />
          </g>
        )}

        {mood === "Angry" && (
          <g>
            {/* Angry Eyebrows */}
            <path d="M 85 80 L 110 95" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            <path d="M 155 80 L 130 95" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" />
            {/* Eyes */}
            <circle cx="100" cy="100" r="6" fill="#1f2937" />
            <circle cx="140" cy="100" r="6" fill="#1f2937" />
            {/* Angry Mouth */}
            <path d="M 105 130 Q 120 120 135 130" stroke="#1f2937" strokeWidth="5" strokeLinecap="round" fill="none" />
            {/* Angry Mark */}
            <path d="M 150 50 L 160 60 L 150 70 L 140 60 Z" fill="#ef4444" opacity="0.8" />
          </g>
        )}

        {/* Arms */}
        <path d="M 80 130 Q 60 140 70 150" stroke={currentColor} strokeWidth="10" strokeLinecap="round" fill="none" />
        <path d="M 150 130 Q 170 140 160 150" stroke={currentColor} strokeWidth="10" strokeLinecap="round" fill="none" />
      </svg>
    </motion.div>
  );
};
