import { motion } from 'framer-motion';
import MatchCard from '../components/MatchCard';

export default function VolunteerMatch() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8 text-center"
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-dim border border-primary/30 text-primary text-xs font-medium rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
          Your match is ready
        </span>
      </motion.div>

      <MatchCard />
    </div>
  );
}
