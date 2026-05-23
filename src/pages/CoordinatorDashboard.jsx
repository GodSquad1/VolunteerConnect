import { useState } from 'react';
import { motion } from 'framer-motion';
import CoordinatorLayout from '../components/CoordinatorLayout';
import StatCard from '../components/StatCard';
import ShiftRow from '../components/ShiftRow';
import ActivityFeedItem from '../components/ActivityFeedItem';
import CommandBar from '../components/CommandBar';
import { org, shifts, activityFeed } from '../data/mockData';

export default function CoordinatorDashboard() {
  const [shiftData, setShiftData] = useState(shifts);

  const handleGapsFilled = () => {
    setShiftData((prev) =>
      prev.map((s) =>
        s.status === 'needs-attention'
          ? { ...s, status: 'filled-by-ai', filled: s.capacity, gaps: 0 }
          : s
      )
    );
  };

  return (
    <CoordinatorLayout>
      <div className="px-8 py-8 space-y-8">
        {/* Page title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-heading text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Good morning — here's where things stand.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: org.activeVolunteers, label: 'Active volunteers' },
            { value: org.shiftsThisWeek, label: 'Shifts this week' },
            { value: org.openGaps, label: 'Open gaps', accent: true },
            { value: `${org.fillRate}%`, label: 'Fill rate' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <StatCard value={stat.value} label={stat.label} accent={stat.accent} />
            </motion.div>
          ))}
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-[1fr_auto] gap-6" style={{ gridTemplateColumns: '60% 1fr' }}>
          {/* Shifts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Upcoming shifts</h2>
              <span className="text-xs text-text-tertiary">{shiftData.length} shifts</span>
            </div>
            <div className="space-y-2">
              {shiftData.map((shift, i) => (
                <motion.div
                  key={shift.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                >
                  <ShiftRow shift={shift} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Recent activity</h2>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="bg-surface border border-border rounded-card px-4 py-3 divide-y divide-border">
              {activityFeed.slice(0, 7).map((item, i) => (
                <ActivityFeedItem key={item.id} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Command bar */}
        <div className="bg-surface border border-border rounded-card p-6">
          <CommandBar onGapsFilled={handleGapsFilled} />
        </div>
      </div>
    </CoordinatorLayout>
  );
}
