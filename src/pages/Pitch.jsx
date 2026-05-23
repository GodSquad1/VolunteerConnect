import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, ExternalLink } from 'lucide-react';

const APP_URL = 'https://volunteer-connect-psi.vercel.app/coordinator';

const SLIDES = [
  { id: 'hook' },
  { id: 'chaos' },
  { id: 'numbers' },
  { id: 'gap' },
  { id: 'solution' },
  { id: 'how' },
  { id: 'demo' },
  { id: 'built' },
  { id: 'close' },
];

function SlideHook() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-16 gap-8">
      <motion.p
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-text-tertiary text-xl tracking-widest uppercase font-light"
        style={{ fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '0.25em' }}
      >
        Saturday · 7:00 AM
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 'clamp(4rem, 11vw, 9rem)', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1, fontWeight: 700, letterSpacing: '-0.04em', color: '#f5f5f5' }}
      >
        We showed up.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-text-secondary text-2xl font-light max-w-2xl leading-relaxed"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        The shift was already full. Nobody told us. Three other volunteers didn't show at all. The food bank served fewer people because of it.
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="w-24 h-0.5 bg-primary mt-4"
        style={{ originX: 0 }}
      />
    </div>
  );
}

function SlideChaos() {
  const items = [
    { tool: 'Group texts', consequence: 'Messages get lost. No-shows happen. Nobody knows who's coming.' },
    { tool: 'Spreadsheets', consequence: 'Last updated three weeks ago. Double-booked. Overflowing.' },
    { tool: 'Hope', consequence: 'The unofficial third tool. Used by every coordinator, every week.' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-20 gap-12">
      <motion.p
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="text-text-tertiary text-sm tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        How 1.5 million nonprofits coordinate volunteers today
      </motion.p>
      <div className="grid grid-cols-3 gap-8">
        {items.map((item, i) => (
          <motion.div
            key={item.tool}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="border-t-2 border-primary pt-4">
              <p style={{ fontSize: '2rem', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '-0.03em' }}>
                {item.tool}
              </p>
            </div>
            <p className="text-text-tertiary text-base leading-relaxed" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
              {item.consequence}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideNumbers() {
  const stats = [
    { value: '1.5M', label: 'nonprofits in the US with volunteer programs' },
    { value: '30–40%', label: 'average no-show rate per shift' },
    { value: '8 hrs', label: 'a week coordinators spend on logistics alone' },
  ];
  return (
    <div className="flex flex-col justify-center items-center h-full px-20 gap-16">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-text-tertiary text-sm tracking-widest uppercase text-center"
        style={{ letterSpacing: '0.2em' }}
      >
        The scale of the problem
      </motion.p>
      <div className="grid grid-cols-3 gap-16 w-full">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.25 }}
            className="flex flex-col items-center text-center gap-3"
          >
            <p style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 700, color: '#4ADE80', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {s.value}
            </p>
            <p className="text-text-secondary text-lg leading-snug max-w-xs" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideGap() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-20 gap-10">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-tertiary text-sm tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        The real problem
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 'clamp(2rem, 4.5vw, 3.75rem)', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.15, letterSpacing: '-0.03em', maxWidth: '18ch' }}
      >
        There is no coordination layer between willing volunteers and the organizations that need them.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-text-tertiary text-xl max-w-2xl leading-relaxed"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        Software solved this for hiring. For scheduling. For payments. Volunteering never got its moment.
      </motion.p>
    </div>
  );
}

function SlideSolution() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-8">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-tertiary text-sm tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        Introducing
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
      >
        <h1 style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', fontWeight: 700, color: '#4ADE80', fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '-0.05em', lineHeight: 1 }}>
          Volunteer<br />Connect
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        style={{ fontSize: '1.5rem', color: '#a3a3a3', fontFamily: 'Instrument Sans, sans-serif', fontWeight: 300 }}
      >
        The coordination OS for volunteer organizations.
      </motion.p>
    </div>
  );
}

function SlideHow() {
  const steps = [
    { num: '01', who: 'Coordinator', action: 'Posts a shift in seconds', detail: 'Set title, date, slots, skills needed. Live instantly.' },
    { num: '02', who: 'Volunteer', action: 'Finds the right opportunity', detail: 'Search by skill, date, or cause. AI matches them automatically.' },
    { num: '03', who: 'Coordinator', action: 'Watches the dashboard fill', detail: 'Real-time sign-up feed. No spreadsheets. No group texts.' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-20 gap-10">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-text-tertiary text-sm tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        How it works
      </motion.p>
      <div className="flex gap-6 items-start">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.22 }}
            className="flex-1 flex flex-col gap-3"
          >
            <p className="text-primary font-mono text-sm">{step.num}</p>
            <div className="h-px bg-border w-full" />
            <p className="text-text-tertiary text-xs uppercase tracking-widest mt-1">{step.who}</p>
            <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
              {step.action}
            </p>
            <p className="text-text-secondary text-base leading-relaxed" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>
              {step.detail}
            </p>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.9, duration: 1.2 }}
        className="h-px bg-primary/30 w-full mt-2"
        style={{ originX: 0 }}
      />
    </div>
  );
}

function SlideDemo() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-10">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-tertiary text-sm tracking-widest uppercase"
        style={{ letterSpacing: '0.2em' }}
      >
        Live product
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1, letterSpacing: '-0.04em' }}
      >
        See it live.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-text-secondary text-xl max-w-xl leading-relaxed"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        Create a shift as a coordinator. Sign up as a volunteer. Watch the feed update in real time.
      </motion.p>
      <motion.a
        href={APP_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileTap={{ scale: 0.97 }}
        className="flex items-center gap-3 px-8 py-4 bg-primary text-bg rounded-btn font-semibold text-xl hover:opacity-90 transition-opacity"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        Open VolunteerConnect <ExternalLink size={20} />
      </motion.a>
    </div>
  );
}

function SlideBuilt() {
  const facts = [
    { label: 'Backend', value: 'Firebase Firestore' },
    { label: 'Auth', value: 'Firebase Auth' },
    { label: 'Real-time', value: 'onSnapshot listeners' },
    { label: 'AI matching', value: 'GPT-4o' },
    { label: 'Deployed', value: 'Vercel' },
    { label: 'Built in', value: 'One session' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-20 gap-12">
      <div className="flex flex-col gap-3">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-text-tertiary text-sm tracking-widest uppercase"
          style={{ letterSpacing: '0.2em' }}
        >
          Under the hood
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '-0.03em', lineHeight: 1.1 }}
        >
          Real auth. Real database.<br />Real volunteers.
        </motion.h2>
      </div>
      <div className="grid grid-cols-3 gap-x-8 gap-y-6">
        {facts.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex flex-col gap-1"
          >
            <p className="text-text-tertiary text-xs uppercase tracking-widest" style={{ letterSpacing: '0.15em' }}>{f.label}</p>
            <p className="text-text-primary font-semibold text-lg" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>{f.value}</p>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-text-secondary text-lg max-w-2xl leading-relaxed"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        The same infrastructure that runs this demo scales to every volunteer organization in the country.
      </motion.p>
    </div>
  );
}

function SlideClose() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-10 px-16">
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-text-tertiary text-lg"
        style={{ fontFamily: 'Instrument Sans, sans-serif' }}
      >
        We started at a food bank on a Saturday morning.
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 700, color: '#f5f5f5', fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '-0.03em', lineHeight: 1.2, maxWidth: '20ch' }}
      >
        We're not stopping until every shift is filled and every volunteer finds their place.
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex flex-col items-center gap-2 mt-4"
      >
        <p style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, color: '#4ADE80', fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '-0.04em' }}>
          VolunteerConnect
        </p>
        <p className="text-text-tertiary text-base" style={{ fontFamily: 'Instrument Sans, sans-serif', letterSpacing: '0.1em' }}>
          volunteer-connect-psi.vercel.app
        </p>
      </motion.div>
    </div>
  );
}

const SLIDE_COMPONENTS = [
  SlideHook, SlideChaos, SlideNumbers, SlideGap,
  SlideSolution, SlideHow, SlideDemo, SlideBuilt, SlideClose,
];

export default function Pitch() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = useCallback((idx) => {
    if (idx < 0 || idx >= SLIDES.length) return;
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); next(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, prev, navigate]);

  const SlideContent = SLIDE_COMPONENTS[current];

  const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 80 : -80 }),
    center: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -80 : 80 }),
  };

  return (
    <div
      className="fixed inset-0 bg-bg flex flex-col select-none"
      onClick={next}
      style={{ cursor: current < SLIDES.length - 1 ? 'pointer' : 'default' }}
    >
      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0"
          >
            <SlideContent />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div
        className="flex items-center justify-between px-10 py-5 border-t border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dot progress */}
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 24 : 6,
                height: 6,
                backgroundColor: i === current ? '#4ADE80' : i < current ? '#4ADE8060' : '#333',
              }}
            />
          ))}
        </div>

        {/* Slide counter */}
        <p className="text-text-tertiary text-xs font-mono tabular-nums">
          {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </p>

        {/* Nav arrows */}
        <div className="flex items-center gap-3">
          <button
            onClick={prev}
            disabled={current === 0}
            className="p-2 rounded-btn border border-border text-text-tertiary hover:text-text-primary hover:border-border-bright transition-colors disabled:opacity-20"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={next}
            disabled={current === SLIDES.length - 1}
            className="p-2 rounded-btn border border-border text-text-tertiary hover:text-text-primary hover:border-border-bright transition-colors disabled:opacity-20"
          >
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
