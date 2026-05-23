import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User } from 'lucide-react';
import { volunteers } from '../data/mockData';

const statusConfig = {
  full: { label: 'Fully staffed', color: '#4ADE80', bg: '#16532D' },
  partial: { label: 'Filling up', color: '#FB923C', bg: '#7C2D12' },
  'needs-attention': { label: '3 gaps — needs attention', color: '#FB923C', bg: '#7C2D12' },
  'filled-by-ai': { label: 'Fully staffed', color: '#4ADE80', bg: '#16532D' },
};

export default function ShiftRow({ shift, highlight = false }) {
  const [expanded, setExpanded] = useState(false);
  const fillPercent = Math.round((shift.filled / shift.capacity) * 100);
  const status = statusConfig[shift.status] || statusConfig.partial;
  const isNeedsAttention = shift.status === 'needs-attention';

  const shiftVolunteers = volunteers.filter((v) => shift.volunteers?.includes(v.id));

  return (
    <div>
      <motion.div
        layout
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-4 px-4 py-3 rounded-card cursor-pointer transition-colors border ${
          isNeedsAttention
            ? 'border-accent/40 bg-accent-dim/20 hover:bg-accent-dim/30'
            : 'border-border hover:border-border-bright bg-surface hover:bg-surface-raised'
        }`}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text-primary truncate">{shift.name}</span>
            {isNeedsAttention && (
              <span className="text-xs text-accent">⚡</span>
            )}
          </div>
          <span className="text-xs text-text-tertiary">{shift.date} · {shift.time}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-text-secondary">{shift.filled}/{shift.capacity}</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fillPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  backgroundColor: isNeedsAttention ? '#FB923C' : '#4ADE80',
                }}
              />
            </div>
          </div>

          <span
            className="text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap"
            style={{ color: status.color, backgroundColor: status.bg }}
          >
            {status.label}
          </span>

          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} className="text-text-tertiary" />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pt-2 border-x border-b border-border rounded-b-card bg-surface-raised">
              <p className="text-xs text-text-tertiary mb-2 uppercase tracking-wider">Volunteers on this shift</p>
              {shiftVolunteers.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {shiftVolunteers.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center gap-1.5 bg-surface border border-border rounded-full px-3 py-1"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold text-bg"
                        style={{ backgroundColor: v.color }}
                      >
                        {v.avatar}
                      </div>
                      <span className="text-xs text-text-primary">{v.name}</span>
                      <span className="text-xs text-text-tertiary">{v.reliabilityScore}%</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-text-tertiary text-xs">
                  <User size={12} />
                  <span>No volunteers assigned yet</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
