import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { surgeVolunteers } from '../data/mockData';

const CIRCUMFERENCE = 2 * Math.PI * 60; // r=60

export default function SurgeCounter({ onComplete }) {
  const [count, setCount] = useState(0);
  const [confirmedNames, setConfirmedNames] = useState([]);
  const total = 20;

  useEffect(() => {
    if (count >= total) {
      if (onComplete) onComplete();
      return;
    }
    const delay = count < 5 ? 800 : count < 12 ? 1200 : count < 18 ? 1400 : 1000;
    const timer = setTimeout(() => {
      setCount((c) => c + 1);
      setConfirmedNames((prev) => [...prev, surgeVolunteers[count]]);
    }, delay);
    return () => clearTimeout(timer);
  }, [count, total, onComplete]);

  const progress = count / total;
  const dashOffset = CIRCUMFERENCE * (1 - progress);
  const isDone = count >= total;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Ring + counter */}
      <div className="relative w-48 h-48">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#2A2A2A" strokeWidth="8" />
          <motion.circle
            cx="70"
            cy="70"
            r="60"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            animate={{
              strokeDashoffset: dashOffset,
              stroke: isDone ? '#4ADE80' : '#FB923C',
            }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ strokeDashoffset: dashOffset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={count}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-5xl font-semibold tracking-heading"
            style={{ color: isDone ? '#4ADE80' : '#F5F5F5' }}
          >
            {count}
            <span className="text-2xl text-text-tertiary">/{total}</span>
          </motion.span>
          <span className="text-xs text-text-tertiary mt-1">volunteers confirmed</span>
        </div>
      </div>

      {/* Live feed */}
      <div className="w-full max-w-sm space-y-1.5 max-h-64 overflow-y-auto">
        {confirmedNames.map((name, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-2 text-sm"
          >
            <span className="text-primary text-xs">✓</span>
            <span className="text-text-primary font-medium">{name}</span>
            <span className="text-text-tertiary">— confirmed</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
