import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, ExternalLink } from 'lucide-react';
import { matchResult } from '../data/mockData';

export default function MatchCard({ opportunity, onShowAlternatives, hasAlternatives }) {
  const navigate = useNavigate();
  const [personalNote, setPersonalNote] = useState(null);

  // Use passed opportunity or fall back to mock
  const opp = opportunity || null;

  useEffect(() => {
    const tryGet = () => {
      const stored = sessionStorage.getItem('matchNote');
      if (stored) { setPersonalNote(stored); return true; }
      return false;
    };
    if (!tryGet()) {
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        if (tryGet() || attempts > 20) clearInterval(poll);
      }, 400);
      return () => clearInterval(poll);
    }
  }, []);

  const orgName = opp?.orgName ?? matchResult.orgName;
  const orgInitials = opp
    ? opp.orgName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : matchResult.orgInitials;
  const title = opp?.description ?? matchResult.title;
  const date = opp?.date ?? matchResult.date;
  const location = opp?.address ?? opp?.location ?? matchResult.location;
  const remote = opp?.remote ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[560px] bg-surface-raised border border-border rounded-card overflow-hidden"
    >
      {/* Org header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        {opp?.orgLogo ? (
          <img
            src={opp.orgLogo}
            alt={orgName}
            className="w-10 h-10 rounded-full object-cover bg-surface shrink-0"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-bg shrink-0"
            style={{ backgroundColor: matchResult.orgColor }}
          >
            {orgInitials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{orgName}</p>
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary bg-surface border border-border px-2 py-0.5 rounded-full mt-0.5">
            <MapPin size={10} />
            {remote ? 'Remote / Online' : location}
          </span>
        </div>
        {opp?.orgUrl && (
          <a
            href={opp.orgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Image placeholder */}
      <div
        className="w-full relative"
        style={{
          paddingBottom: '42%',
          background: 'linear-gradient(135deg, #16532D 0%, #0A2E18 40%, #0A0A0A 100%)',
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Users size={40} className="text-primary" />
        </div>
        {opp?.activities?.length > 0 && (
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {opp.activities.slice(0, 3).map((a) => (
              <span
                key={a}
                className="text-xs px-2 py-0.5 rounded-full bg-black/50 text-text-secondary border border-white/10"
              >
                {a}
              </span>
            ))}
          </div>
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(17,17,17,0.8) 0%, transparent 60%)' }}
        />
      </div>

      {/* Content */}
      <div className="px-6 py-5 space-y-4">
        <h2 className="text-xl font-semibold text-text-primary leading-snug tracking-heading">
          {opp?.orgName ?? matchResult.title}
        </h2>
        {opp?.description && (
          <p className="text-sm text-text-secondary leading-relaxed -mt-2">
            {opp.description}
          </p>
        )}

        {/* Personal note */}
        <div className="border-l-2 border-primary pl-4 bg-primary-dim/30 rounded-r-btn py-3 pr-3 min-h-[72px]">
          {personalNote ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-text-secondary leading-relaxed italic"
            >
              "{personalNote}"
            </motion.p>
          ) : (
            <div className="space-y-2 py-1">
              {[90, 75, 50].map((w, i) => (
                <motion.div
                  key={i}
                  className="h-3 bg-primary-dim rounded-full"
                  style={{ width: `${w}%` }}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
          <span className="flex items-center gap-1.5">
            <Calendar size={14} className="text-primary" />
            {date}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-primary" />
            {remote ? 'Remote' : location}
          </span>
          {opp?.duration && (
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-accent" style={{ color: '#FB923C' }} />
              <span style={{ color: '#FB923C' }}>{opp.duration}</span>
            </span>
          )}
          {!opp && (
            <span className="flex items-center gap-1.5">
              <Users size={14} style={{ color: '#FB923C' }} />
              <span style={{ color: '#FB923C' }}>{matchResult.spotsLeft} spots left</span>
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/volunteer/confirmed')}
            className="w-full h-11 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            I'm in — commit to this shift
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              if (hasAlternatives) onShowAlternatives?.();
              else navigate('/volunteer/intake');
            }}
            className="w-full h-11 bg-transparent border border-border text-text-secondary rounded-btn text-sm hover:border-border-bright hover:text-text-primary transition-colors"
          >
            {hasAlternatives ? 'Show me other options' : 'Start over'}
          </motion.button>
        </div>

        <p className="text-xs text-text-tertiary text-center">
          Committing takes 10 seconds. We'll handle the rest.
        </p>
      </div>
    </motion.div>
  );
}
