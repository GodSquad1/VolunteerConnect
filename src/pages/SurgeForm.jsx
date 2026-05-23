import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Zap } from 'lucide-react';
import CoordinatorLayout from '../components/CoordinatorLayout';

export default function SurgeForm() {
  const navigate = useNavigate();
  const [what, setWhat] = useState('');
  const [count, setCount] = useState(10);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const canSubmit = what.trim().length > 0 && count > 0;

  return (
    <CoordinatorLayout>
      <div className="px-8 py-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-card px-6 py-4 mb-8 flex items-center gap-3"
          style={{ backgroundColor: '#7C2D12', border: '1px solid #FB923C40' }}
        >
          <Zap size={18} style={{ color: '#FB923C' }} />
          <div>
            <span className="text-sm font-semibold text-white uppercase tracking-wider">
              SURGE MODE
            </span>
            <span className="text-sm text-orange-200 ml-2">— Emergency volunteer request</span>
          </div>
        </motion.div>

        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-semibold tracking-heading text-text-primary mb-2">
              Send a surge request
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              Post an urgent need. VolunteerConnect will blast matched volunteers and fill your slots in real time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* What do you need */}
            <div className="space-y-2">
              <label className="text-xs text-text-tertiary uppercase tracking-wider">
                What do you need help with?
              </label>
              <input
                type="text"
                value={what}
                onChange={(e) => setWhat(e.target.value)}
                placeholder="e.g. Serving meals at Saturday morning shift"
                className="w-full h-12 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-accent"
                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
              />
            </div>

            {/* How many volunteers */}
            <div className="space-y-2">
              <label className="text-xs text-text-tertiary uppercase tracking-wider">
                How many volunteers?
              </label>
              <div className="flex items-center gap-4">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  className="w-10 h-10 bg-surface-raised border border-border rounded-btn flex items-center justify-center hover:border-border-bright transition-colors"
                >
                  <Minus size={14} className="text-text-secondary" />
                </motion.button>
                <span className="text-2xl font-semibold text-text-primary w-10 text-center tracking-heading">
                  {count}
                </span>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setCount((c) => c + 1)}
                  className="w-10 h-10 bg-surface-raised border border-border rounded-btn flex items-center justify-center hover:border-border-bright transition-colors"
                >
                  <Plus size={14} className="text-text-secondary" />
                </motion.button>
              </div>
            </div>

            {/* When by */}
            <div className="space-y-2">
              <label className="text-xs text-text-tertiary uppercase tracking-wider">When by?</label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1 h-12 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                  style={{
                    fontFamily: 'Instrument Sans, sans-serif',
                    colorScheme: 'dark',
                  }}
                />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-36 h-12 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary outline-none transition-colors focus:border-accent"
                  style={{
                    fontFamily: 'Instrument Sans, sans-serif',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => canSubmit && navigate('/coordinator/surge/live', { state: { what, count } })}
              disabled={!canSubmit}
              className={`flex items-center gap-2 w-full h-12 justify-center rounded-btn font-semibold text-sm transition-all ${
                canSubmit
                  ? 'bg-accent text-bg hover:opacity-90'
                  : 'bg-surface border border-border text-text-tertiary cursor-not-allowed'
              }`}
            >
              <Zap size={16} />
              Send surge request to matched volunteers
            </motion.button>
          </motion.div>
        </div>
      </div>
    </CoordinatorLayout>
  );
}
