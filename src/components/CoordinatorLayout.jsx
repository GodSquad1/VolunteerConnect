import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { org } from '../data/mockData';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/coordinator' },
  { icon: Users, label: 'Volunteers', path: '/coordinator/volunteers' },
  { icon: Calendar, label: 'Shifts', path: '/coordinator/shifts' },
  { icon: Zap, label: 'Surge Mode', path: '/coordinator/surge' },
];

export default function CoordinatorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-text-primary tracking-heading">ShowUp</span>
            <span className="text-xs px-1.5 py-0.5 bg-accent-dim text-accent rounded font-medium">
              Coordinator
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm transition-colors ${
                  active
                    ? 'bg-primary-dim/40 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'
                }`}
              >
                <item.icon size={16} />
                {item.label}
                {active && <ChevronRight size={12} className="ml-auto text-primary" />}
              </motion.button>
            );
          })}
        </nav>

        {/* Org info */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-bg shrink-0"
              style={{ backgroundColor: org.color }}
            >
              {org.initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{org.name}</p>
              <p className="text-xs text-text-tertiary">{org.location}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
