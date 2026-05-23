import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const stats = [
  { value: '70%', label: 'of signups never show up' },
  { value: '30', label: 'automated actions per volunteer' },
  { value: '1', label: 'perfect match, not a list' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <span className="text-lg font-semibold text-text-primary tracking-heading">ShowUp</span>
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/volunteer/intake')}
            className="px-4 py-2 text-sm border border-border text-text-secondary rounded-btn hover:border-border-bright hover:text-text-primary transition-colors"
          >
            I want to volunteer
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/coordinator')}
            className="px-4 py-2 text-sm border border-accent/50 text-accent rounded-btn hover:border-accent hover:bg-accent-dim/20 transition-colors"
          >
            I run an org
          </motion.button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 max-w-3xl"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-dim border border-primary/30 text-primary text-xs font-medium rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Syntesis Hacks 2025
          </span>

          {/* Headline */}
          <h1 className="text-[56px] font-semibold leading-[1.1] tracking-heading">
            Volunteers find meaning.
            <br />
            <span
              className="font-serif italic font-normal"
              style={{ color: '#A3A3A3' }}
            >
              Coordinators stay sane.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg text-text-secondary max-w-[480px] leading-relaxed">
            70% of volunteers who sign up never show up. ShowUp fixes both sides of that problem.
          </p>

          {/* CTAs */}
          <div className="flex gap-4 mt-2">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/volunteer/intake')}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              I want to volunteer
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/coordinator')}
              className="flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-accent text-accent rounded-btn font-semibold text-sm hover:bg-accent-dim/20 transition-colors"
            >
              I run an org
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-6 mt-24"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="bg-surface border border-border rounded-card px-8 py-5 text-center"
            >
              <div className="text-3xl font-semibold text-text-primary tracking-heading mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-text-tertiary max-w-[120px]">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}
