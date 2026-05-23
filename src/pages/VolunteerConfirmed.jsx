import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signUpForOpportunity } from '../lib/firestore';

const confirmationItems = [
  'Confirmation text sent',
  'Calendar invite sent',
  'Org notified',
];

function AnimatedCheck() {
  return (
    <motion.svg width="80" height="80" viewBox="0 0 80 80" fill="none">
      <motion.circle cx="40" cy="40" r="36" stroke="#4ADE80" strokeWidth="3" fill="none"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} />
      <motion.path d="M24 40 L35 51 L56 30" stroke="#4ADE80" strokeWidth="3.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.4 }} />
    </motion.svg>
  );
}

export default function VolunteerConfirmed() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const opp = location.state?.opp;

  // If coming from AI match flow (no real opp), create a signup from sessionStorage
  useEffect(() => {
    if (!user || opp) return; // opp already handled by OpportunityDetail
    const stored = sessionStorage.getItem('vcMatches');
    if (!stored) return;
    try {
      const matches = JSON.parse(stored);
      const top = matches[0];
      if (top) {
        signUpForOpportunity(
          user.uid,
          user.displayName || user.email,
          user.email,
          String(top.id),
          String(top.id),
          top.orgName,
          top.title,
        ).catch(() => {});
      }
    } catch {}
  }, [user]);

  const orgName = opp?.orgName || 'Sunrise Senior Center';
  const date = opp?.date || 'Saturday, 9am–1pm';

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
        className="flex flex-col items-center gap-6 text-center max-w-sm">
        <AnimatedCheck />

        <div>
          <h1 className="text-5xl font-semibold tracking-heading text-text-primary">You're in.</h1>
          <p className="text-base text-text-secondary mt-2">{date} · {orgName}</p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {confirmationItems.map((item, i) => (
            <motion.div key={item} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3 bg-primary-dim/30 border border-primary/20 rounded-card">
              <span className="text-primary text-sm">✓</span>
              <span className="text-sm text-text-primary">{item}</span>
            </motion.div>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="text-sm text-text-secondary italic">
          Last week's volunteers helped serve 312 meals. You're up next.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="flex gap-3">
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/volunteer/dashboard')}
            className="px-5 py-2.5 bg-primary text-bg rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity">
            View my commitments
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate('/volunteer/search')}
            className="px-5 py-2.5 border border-border text-text-secondary rounded-btn text-sm hover:border-border-bright hover:text-text-primary transition-colors">
            Browse more
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
