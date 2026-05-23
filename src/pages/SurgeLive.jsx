import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CoordinatorLayout from '../components/CoordinatorLayout';
import SurgeCounter from '../components/SurgeCounter';

// Confetti particle
function ConfettiParticle({ x, color, delay }) {
  return (
    <motion.div
      className="fixed w-2 h-2 rounded-sm pointer-events-none z-50"
      style={{ left: `${x}%`, top: '-10px', backgroundColor: color }}
      initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: '110vh',
        opacity: [1, 1, 0],
        rotate: 720,
        x: [0, (Math.random() - 0.5) * 200],
      }}
      transition={{ duration: 3 + Math.random() * 2, delay, ease: 'easeIn' }}
    />
  );
}

const confettiColors = ['#4ADE80', '#FB923C', '#818CF8', '#F472B6', '#FBBF24'];

export default function SurgeLive() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDone, setIsDone] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const startTime = useRef(Date.now());

  const { what = 'Emergency volunteer request', count = 20 } = location.state || {};

  const handleComplete = () => {
    setIsDone(true);
    const particles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.8,
    }));
    setConfetti(particles);
    setTimeout(() => setShowSummary(true), 600);
  };

  const elapsed = Math.round((Date.now() - startTime.current) / 1000);

  return (
    <CoordinatorLayout>
      <div className="px-8 py-8">
        {/* Confetti */}
        <AnimatePresence>
          {isDone && confetti.map((p) => (
            <ConfettiParticle key={p.id} x={p.x} color={p.color} delay={p.delay} />
          ))}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card px-6 py-4 mb-8"
          style={{
            backgroundColor: isDone ? '#16532D' : '#7C2D12',
            border: isDone ? '1px solid #4ADE8040' : '1px solid #FB923C40',
          }}
        >
          <motion.p
            key={isDone ? 'done' : 'waiting'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: isDone ? '#4ADE80' : '#FB923C' }}
          >
            {isDone
              ? `All ${count} slots filled. You're covered.`
              : `Surge request sent — waiting for responses`}
          </motion.p>
          <p className="text-xs text-text-secondary mt-0.5">{what}</p>
        </motion.div>

        <div className="flex flex-col items-center gap-10">
          <SurgeCounter onComplete={handleComplete} />

          {/* Summary card */}
          <AnimatePresence>
            {showSummary && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm bg-surface-raised border border-border rounded-card p-6 space-y-4"
              >
                <h3 className="text-base font-semibold text-text-primary">Summary</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Time to fill', value: `~${elapsed}s` },
                    { label: 'Avg response', value: '1.2s' },
                    { label: 'Slots filled', value: `${count}/${count}` },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-xl font-semibold text-primary tracking-heading">{item.value}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-secondary text-center">Org notified ✓</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/coordinator')}
                  className="w-full h-10 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Back to dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </CoordinatorLayout>
  );
}
