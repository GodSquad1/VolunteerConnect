import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, Zap, Users, Calendar, CheckCircle2,
  Sparkles, Clock, Target, TrendingUp,
} from 'lucide-react';

// ── Animated counting number ──────────────────────────────────────────────
function CountUp({ target, suffix = '', duration = 1.8 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{display}{suffix}</>;
}

// ── Live activity ticker ──────────────────────────────────────────────────
const tickerItems = [
  { color: '#4ADE80', text: 'Maya Chen committed to Saturday shift' },
  { color: '#4ADE80', text: 'Jordan Lee confirmed — slot filled' },
  { color: '#FB923C', text: '3 gaps in Tuesday shift — AI filling now' },
  { color: '#4ADE80', text: 'Priya Patel matched to Sunrise Senior Center' },
  { color: '#4ADE80', text: 'All 20 surge slots filled in 24 seconds' },
  { color: '#FB923C', text: 'Sam Torres nudged — confirmation pending' },
];

function ActivityTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % tickerItems.length), 2800);
    return () => clearInterval(t);
  }, []);
  const item = tickerItems[idx];
  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <motion.div
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: item.color }}
        animate={{ scale: [1, 1.6, 1] }}
        transition={{ duration: 0.4 }}
      />
      <AnimatePresence mode="wait">
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-text-secondary truncate"
        >
          {item.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

// ── Floating glow orbs ────────────────────────────────────────────────────
function GlowOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(74,222,128,0.07) 0%, transparent 70%)',
          top: '10%', left: '-10%',
        }}
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)',
          top: '20%', right: '-8%',
        }}
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(74,222,128,0.04) 0%, transparent 70%)',
          bottom: '5%', right: '20%',
        }}
        animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
    </div>
  );
}

// ── Coordinator mini-preview card ─────────────────────────────────────────
const previewShifts = [
  { name: 'Saturday Meals', fill: 100, status: 'full' },
  { name: 'Tuesday Tutoring', fill: 50, status: 'gap' },
  { name: 'Sunday Outreach', fill: 75, status: 'ok' },
];

function CoordinatorPreview() {
  return (
    <div className="bg-surface border border-border rounded-card p-4 space-y-3 text-left w-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-primary">Upcoming shifts</span>
        <span className="text-xs text-text-tertiary">3 shifts</span>
      </div>
      {previewShifts.map((s) => (
        <div key={s.name} className="space-y-1">
          <div className="flex justify-between">
            <span className="text-xs text-text-secondary">{s.name}</span>
            <span
              className="text-xs font-medium"
              style={{ color: s.status === 'gap' ? '#FB923C' : '#4ADE80' }}
            >
              {s.fill}%
            </span>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${s.fill}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: s.status === 'gap' ? '#FB923C' : '#4ADE80' }}
            />
          </div>
        </div>
      ))}
      <div className="pt-1 border-t border-border">
        <div className="flex items-center gap-2 bg-surface-raised rounded-btn px-3 py-2">
          <Zap size={10} className="text-primary shrink-0" />
          <ActivityTicker />
        </div>
      </div>
    </div>
  );
}

// ── Volunteer mini-preview card ────────────────────────────────────────────
function VolunteerPreview() {
  const [selected, setSelected] = useState(null);
  const options = ['Help people', 'Environment', 'Education', 'Animals'];
  return (
    <div className="bg-surface border border-border rounded-card p-4 space-y-3 text-left w-full">
      <p className="text-xs font-medium text-text-primary">What kind of impact?</p>
      <div className="grid grid-cols-2 gap-1.5">
        {options.map((o) => (
          <motion.button
            key={o}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(o)}
            className={`text-xs px-2 py-2 rounded-btn border transition-colors text-left ${
              selected === o
                ? 'border-primary bg-primary-dim text-primary'
                : 'border-border text-text-secondary hover:border-border-bright'
            }`}
          >
            {o}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-primary-dim/40 border border-primary/20 rounded-btn px-3 py-2"
          >
            <CheckCircle2 size={12} className="text-primary shrink-0" />
            <span className="text-xs text-primary">Finding your match...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
const features = [
  {
    icon: Target,
    title: 'One perfect match',
    body: 'Not a directory. Not a list. One opportunity that actually fits — based on your values, skills, and schedule.',
    color: '#4ADE80',
  },
  {
    icon: Zap,
    title: 'AI fills your gaps',
    body: 'Tell the coordinator AI what you need in plain English. It scores, outreaches, and confirms volunteers automatically.',
    color: '#FB923C',
  },
  {
    icon: TrendingUp,
    title: '50% no-show rate, solved',
    body: 'Smart reminders, reliability scoring, and instant replacement — so your shifts are always covered.',
    color: '#818CF8',
  },
];

const wordAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  }),
};

export default function Landing() {
  const navigate = useNavigate();
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const line1 = 'Volunteers find meaning.'.split(' ');
  const line2 = 'Coordinators stay sane.'.split(' ');

  return (
    <div className="min-h-screen bg-bg text-text-primary overflow-x-hidden">
      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-4 border-b border-border/60 bg-bg/80 backdrop-blur-md"
      >
        <span className="text-base font-semibold tracking-heading">VolunteerConnect</span>
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?role=volunteer&next=/volunteer/intake')}
            className="px-4 py-2 text-sm border border-border text-text-secondary rounded-btn hover:border-border-bright hover:text-text-primary transition-colors"
          >
            Volunteer
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth?role=coordinator&next=/coordinator')}
            className="px-4 py-2 text-sm bg-accent text-bg rounded-btn font-semibold hover:opacity-90 transition-opacity"
          >
            Coordinator →
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-8">
        <GlowOrbs />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-2 mb-8"
          >
            <div className="h-px w-8 bg-border" />
            <span className="text-xs text-text-tertiary uppercase tracking-[0.15em] font-medium">
              Two-sided volunteer platform
            </span>
            <div className="h-px w-8 bg-border" />
          </motion.div>

          {/* Headline — word by word */}
          <h1 className="text-[64px] font-semibold leading-[1.08] tracking-heading mb-0">
            <span className="block">
              {line1.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={wordAnimation}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block font-serif italic font-normal" style={{ color: '#A3A3A3' }}>
              {line2.map((word, i) => (
                <motion.span
                  key={i}
                  custom={i + line1.length}
                  variants={wordAnimation}
                  initial="hidden"
                  animate="visible"
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
            </span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="mt-7 text-[18px] text-text-secondary max-w-[500px] leading-relaxed"
          >
            50% of volunteers who sign up never show up due to confusion.
            <br />
            <span className="text-text-primary">VolunteerConnect fixes both sides of that.</span>
          </motion.p>

          {/* CTA pair */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="flex gap-4 mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth?role=volunteer&next=/volunteer/intake')}
              className="flex items-center gap-2 px-7 py-3.5 bg-primary text-bg rounded-btn font-semibold text-sm shadow-[0_0_24px_rgba(74,222,128,0.25)] hover:shadow-[0_0_32px_rgba(74,222,128,0.35)] transition-shadow"
            >
              <Users size={15} />
              I want to volunteer
              <ArrowRight size={15} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/auth?role=coordinator&next=/coordinator')}
              className="flex items-center gap-2 px-7 py-3.5 border border-accent/60 text-accent rounded-btn font-semibold text-sm hover:bg-accent-dim/20 hover:border-accent transition-colors"
            >
              <Zap size={15} />
              I run an org
              <ArrowRight size={15} />
            </motion.button>
          </motion.div>
        </div>

        {/* ── Two-panel preview ── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mt-20 w-full max-w-3xl grid grid-cols-2 gap-5"
        >
          {/* Volunteer side */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                Volunteer experience
              </span>
            </div>
            <VolunteerPreview />
            <p className="text-xs text-text-tertiary pl-1">
              4 questions → 1 match. No browsing required.
            </p>
          </div>

          {/* Coordinator side */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                Coordinator dashboard
              </span>
            </div>
            <CoordinatorPreview />
            <p className="text-xs text-text-tertiary pl-1">
              Ask in plain English. AI handles the rest.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ── Stats strip ── */}
      <section ref={statsRef} className="border-y border-border bg-surface py-12">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 divide-x divide-border">
          {[
            { value: 70, suffix: '%', label: 'of signups never show up', sub: 'The problem we\'re solving' },
            { value: 47, suffix: '', label: 'volunteers managed', sub: 'Per org, on average' },
            { value: 24, suffix: 's', label: 'to fill a surge request', sub: 'With AI matching' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={statsVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="flex flex-col items-center text-center px-8"
            >
              <span className="text-5xl font-semibold tracking-heading text-text-primary">
                {statsVisible ? <CountUp target={s.value} suffix={s.suffix} /> : `0${s.suffix}`}
              </span>
              <span className="text-sm text-text-primary mt-1">{s.label}</span>
              <span className="text-xs text-text-tertiary mt-0.5">{s.sub}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section className="py-24 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-semibold tracking-heading mb-3">
              Built for both sides of the problem
            </h2>
            <p className="text-text-secondary max-w-md mx-auto text-sm">
              Most platforms optimize for one side. VolunteerConnect builds intelligence into the whole loop.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="bg-surface border border-border rounded-card p-6 space-y-3 group hover:border-border-bright transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-btn flex items-center justify-center"
                  style={{ backgroundColor: `${f.color}15` }}
                >
                  <f.icon size={18} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{f.title}</h3>
                <p className="text-xs text-text-tertiary leading-relaxed">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="pb-28 px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center border border-border rounded-card py-16 px-12 bg-surface relative overflow-hidden"
        >
          {/* Card glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(74,222,128,0.06) 0%, transparent 60%)',
            }}
          />
          <div className="relative z-10 space-y-5">
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs text-primary font-medium uppercase tracking-wider">
                Ready to try it?
              </span>
            </div>
            <h2 className="text-3xl font-semibold tracking-heading">
              Pick your side.
            </h2>
            <p className="text-sm text-text-secondary max-w-sm mx-auto">
              Complete a 4-question intake and get matched in seconds — or step into the coordinator
              dashboard and watch AI fill your gaps in real time.
            </p>
            <div className="flex gap-4 justify-center pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth?role=volunteer&next=/volunteer/intake')}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-bg rounded-btn font-semibold text-sm shadow-[0_0_20px_rgba(74,222,128,0.2)] hover:shadow-[0_0_28px_rgba(74,222,128,0.3)] transition-shadow"
              >
                Start volunteer intake
                <ArrowRight size={14} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/auth?role=coordinator&next=/coordinator')}
                className="flex items-center gap-2 px-6 py-3 border border-border text-text-secondary rounded-btn text-sm hover:border-border-bright hover:text-text-primary transition-colors"
              >
                Open dashboard
                <ArrowRight size={14} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-10 py-6 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-heading text-text-primary">VolunteerConnect</span>
        <span className="text-xs text-text-tertiary">Built for people who actually show up.</span>
      </footer>
    </div>
  );
}
