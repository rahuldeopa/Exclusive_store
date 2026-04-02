import React from 'react';
import { motion } from 'framer-motion';

export default function SkeletonLoader({ className = '', width, height }) {
  const style = {
    width: width || '100%',
    height: height || '100%'
  };

  return (
    <div 
      className={`relative overflow-hidden bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`} 
      style={style}
    >
      <motion.div
        className="absolute inset-0 z-10"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          width: '50%'
        }}
        animate={{
          x: ['-200%', '300%']
        }}
        transition={{
          repeat: Infinity,
          repeatType: 'loop',
          duration: 1.5,
          ease: 'linear'
        }}
      />
    </div>
  );
}
