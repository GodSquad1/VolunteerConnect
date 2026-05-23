import { motion } from 'framer-motion';

const dotColors = {
  green: '#4ADE80',
  amber: '#FB923C',
  red: '#F87171',
};

export default function ActivityFeedItem({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="flex items-start gap-3 py-2"
    >
      <div className="relative mt-1 shrink-0">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: dotColors[item.color] || '#525252' }}
        />
        {item.isPulse && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: dotColors[item.color] }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-primary leading-snug">{item.text}</p>
      </div>
      <span className="text-xs text-text-tertiary shrink-0 pt-0.5">{item.time}</span>
    </motion.div>
  );
}
