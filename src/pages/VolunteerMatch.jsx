import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, ExternalLink } from 'lucide-react';
import MatchCard from '../components/MatchCard';

function AlternativeCard({ opportunity, index, onSelect }) {
  const orgInitials = opportunity.orgName
    .split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.35 }}
      className="bg-surface-raised border border-border rounded-card overflow-hidden flex flex-col"
    >
      {/* Mini image */}
      <div
        className="h-24 relative"
        style={{ background: 'linear-gradient(135deg, #16532D 0%, #0A2E18 60%, #0A0A0A 100%)' }}
      >
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[10px] font-semibold text-bg">
            {orgInitials}
          </div>
          <span className="text-xs text-text-secondary truncate max-w-[140px]">
            {opportunity.orgName}
          </span>
        </div>
        {opportunity.activities?.[0] && (
          <span className="absolute bottom-2 left-3 text-xs px-2 py-0.5 rounded-full bg-black/50 text-text-secondary border border-white/10">
            {opportunity.activities[0]}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">
          {opportunity.orgName}
        </h3>

        <div className="flex flex-col gap-1 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <MapPin size={11} className="text-primary shrink-0" />
            {opportunity.address || opportunity.location}
          </span>
        </div>

        {opportunity.description && (
          <p className="text-xs text-text-tertiary line-clamp-2 leading-relaxed">
            {opportunity.description.slice(0, 120)}…
          </p>
        )}

        <div className="flex gap-2 mt-auto pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(opportunity)}
            className="flex-1 h-8 bg-primary text-bg rounded-btn text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            View this one
          </motion.button>
          {opportunity.url && (
            <a
              href={opportunity.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 border border-border rounded-btn flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:border-border-bright transition-colors"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function VolunteerMatch() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [showAlternatives, setShowAlternatives] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('vcMatches');
    if (stored) {
      try { setMatches(JSON.parse(stored)); } catch {}
    }
  }, []);

  const primary = matches[primaryIdx] || null;
  const alternatives = matches.filter((_, i) => i !== primaryIdx);

  const handleSelectAlternative = (opp) => {
    const idx = matches.indexOf(opp);
    setPrimaryIdx(idx);
    sessionStorage.removeItem('matchNote'); // clear old note so card shimmers
    setShowAlternatives(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-bg px-8 py-16">
      <AnimatePresence mode="wait">
        {!showAlternatives ? (
          <motion.div
            key="primary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-dim border border-primary/30 text-primary text-xs font-medium rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                {matches.length > 0 ? 'Your best match from live opportunities' : 'Your match is ready'}
              </span>
            </div>
            <MatchCard
              opportunity={primary}
              hasAlternatives={alternatives.length > 0}
              onShowAlternatives={() => setShowAlternatives(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="alternatives"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => setShowAlternatives(false)}
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft size={14} />
                Back to top match
              </button>
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-text-tertiary">{alternatives.length} other opportunities</span>
            </div>

            <h2 className="text-2xl font-semibold tracking-heading mb-2">Other options for you</h2>
            <p className="text-sm text-text-secondary mb-8">
              These are real opportunities ranked by how well they fit your answers.
            </p>

            <div className="grid grid-cols-3 gap-4">
              {alternatives.map((opp, i) => (
                <AlternativeCard
                  key={opp.id || i}
                  opportunity={opp}
                  index={i}
                  onSelect={handleSelectAlternative}
                />
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/volunteer/intake')}
                className="text-sm text-text-tertiary hover:text-text-secondary underline underline-offset-2 transition-colors"
              >
                None of these feel right — start over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
