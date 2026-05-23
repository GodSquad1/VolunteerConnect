import { motion } from 'framer-motion';

export default function StatCard({ value, label, accent = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-border rounded-card p-6 flex flex-col gap-1"
    >
      <span
        className="text-4xl font-semibold tracking-heading"
        style={{ color: accent ? '#FB923C' : '#4ADE80' }}
      >
        {value}
      </span>
      <span className="text-sm text-text-secondary">{label}</span>
    </motion.div>
  );
}
