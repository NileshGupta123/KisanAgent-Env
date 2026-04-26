import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ label, value }) => {
  const percentage = Math.round(value > 1 ? value : value * 100);
  const color = percentage < 40 ? "#E63946" : (percentage < 70 ? "#F4A261" : "#2D6A4F");
  
  return (
    <div className="progress-container mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-zinc-600 tracking-wide">{label}</span>
        <span className="text-xs font-extrabold" style={{ color }}>{percentage}%</span>
      </div>
      <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          style={{ backgroundColor: color }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};
