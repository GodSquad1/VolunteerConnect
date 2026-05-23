import { motion } from 'framer-motion';

export default function TaskFeedItem({ icon, text, color = 'green', index = 0 }) {
  const colorMap = {
    green: '#4ADE80',
    amber: '#FB923C',
    red: '#F87171',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      className="flex items-center gap-3 py-2 px-3 rounded-btn bg-surface border border-border"
    >
      <span style={{ color: colorMap[color] }} className="text-sm font-medium w-4 text-center">
        {icon}
      </span>
      <span className="text-sm text-text-primary">{text}</span>
    </motion.div>
  );
}
