import React from 'react';
import { motion } from 'framer-motion';

export const ScoreRing = ({ score }) => {
  const percentage = Math.round(score > 1 ? score : score * 100);
  const color = percentage < 40 ? "#E63946" : (percentage < 70 ? "#F4A261" : "#2D6A4F");
  const glowClass = percentage < 40 ? "score-glow-red" : (percentage < 70 ? "score-glow-orange" : "score-glow-green");

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${glowClass}`}>
        <svg viewBox="0 0 36 36" className="circular-chart w-48 h-48 sm:w-56 sm:h-56">
          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <motion.path 
            className="circle" 
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            style={{ stroke: color }} 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
          />
          <text x="18" y="20.35" className="percentage font-bold">{percentage}%</text>
        </svg>
      </div>
      <p className="text-xs font-black text-emerald-800/60 uppercase tracking-widest mt-6">Environment Score</p>
    </div>
  );
};
