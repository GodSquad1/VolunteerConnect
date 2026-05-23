import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Users, Zap, Check } from 'lucide-react';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from '../lib/firebase';

const volunteerContext = {
  role: 'volunteer',
  label: 'Volunteer',
  color: '#4ADE80',
  dimColor: '#16532D',
  icon: Users,
  tagline: 'Find your perfect opportunity in 4 questions.',
};

const coordinatorContext = {
  role: 'coordinator',
  label: 'Coordinator',
  color: '#FB923C',
  dimColor: '#7C2D12',
  icon: Zap,
  tagline: 'Manage your roster with AI — in plain English.',
};

const firebaseErrorMessage = (code) => {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return 'Something went wrong. Please try again.';
  }
};

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';
  const roleParam = searchParams.get('role') || 'volunteer';

  const ctx = roleParam === 'coordinator' ? coordinatorContext : volunteerContext;
  const Icon = ctx.icon;

  const [tab, setTab] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'signup' && !name) { setError('Please enter your name.'); return; }
    if (tab === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setDone(true);
      setTimeout(() => navigate(next), 900);
    } catch (err) {
      setError(firebaseErrorMessage(err.code));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ── Left panel — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between p-12 border-r border-border relative overflow-hidden"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 30% 40%, ${ctx.color}0D 0%, transparent 65%)`,
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-text-tertiary hover:text-text-secondary transition-colors text-sm mb-12"
          >
            <ArrowLeft size={14} />
            Back to ShowUp
          </button>

          <div
            className="w-12 h-12 rounded-card flex items-center justify-center mb-6"
            style={{ backgroundColor: `${ctx.color}1A`, border: `1px solid ${ctx.color}30` }}
          >
            <Icon size={22} style={{ color: ctx.color }} />
          </div>

          <h2 className="text-2xl font-semibold tracking-heading text-text-primary mb-2">
            {ctx.label} account
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">{ctx.tagline}</p>
        </div>

        {/* Testimonial */}
        <div className="relative z-10">
          <div
            className="rounded-card p-5 border"
            style={{ backgroundColor: `${ctx.color}08`, borderColor: `${ctx.color}20` }}
          >
            <p className="text-sm text-text-secondary italic leading-relaxed mb-3">
              {roleParam === 'coordinator'
                ? '"I told it I had 3 gaps — it filled them before I finished my coffee."'
                : '"It matched me to something that genuinely matters to me. First try."'}
            </p>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-bg"
                style={{ backgroundColor: ctx.color }}
              >
                {roleParam === 'coordinator' ? 'SP' : 'MC'}
              </div>
              <div>
                <p className="text-xs font-medium text-text-primary">
                  {roleParam === 'coordinator' ? 'Sara P.' : 'Maya C.'}
                </p>
                <p className="text-xs text-text-tertiary">
                  {roleParam === 'coordinator' ? 'Sunrise Senior Center' : 'Volunteer, Oakland'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        {/* Mobile back */}
        <button
          onClick={() => navigate('/')}
          className="lg:hidden absolute top-6 left-6 flex items-center gap-1.5 text-text-tertiary hover:text-text-secondary transition-colors text-sm"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-[380px]"
        >
          {/* ShowUp logo (mobile) */}
          <p className="lg:hidden text-sm font-semibold tracking-heading text-text-primary mb-8">
            ShowUp
          </p>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface border border-border rounded-card mb-8">
            {['signin', 'signup'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-2 text-sm font-medium rounded-btn transition-colors ${
                  tab === t
                    ? 'bg-surface-raised text-text-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {t === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${ctx.color}1A`, border: `2px solid ${ctx.color}` }}
                >
                  <Check size={22} style={{ color: ctx.color }} />
                </motion.div>
                <div>
                  <p className="text-base font-semibold text-text-primary">
                    {tab === 'signup' ? `Welcome, ${name || 'there'}!` : 'Welcome back!'}
                  </p>
                  <p className="text-sm text-text-tertiary mt-0.5">Taking you in...</p>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key={tab}
                initial={{ opacity: 0, x: tab === 'signup' ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {tab === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-text-tertiary uppercase tracking-wider">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Maya Chen"
                      autoFocus
                      className="w-full h-11 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-primary"
                      style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-text-tertiary uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus={tab === 'signin'}
                    className="w-full h-11 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-primary"
                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-text-tertiary uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 bg-surface-raised border border-border rounded-card px-4 pr-10 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-primary"
                      style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  className="w-full h-11 rounded-btn font-semibold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-70 mt-2"
                  style={{ backgroundColor: ctx.color, color: '#0A0A0A' }}
                >
                  {loading ? (
                    <motion.div
                      className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <>
                      {tab === 'signin' ? 'Sign in' : 'Create account'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </motion.button>

                {tab === 'signin' && (
                  <p className="text-center text-xs text-text-tertiary pt-1">
                    No account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('signup'); setError(''); }}
                      className="text-text-secondary underline underline-offset-2 hover:text-text-primary transition-colors"
                    >
                      Create one free
                    </button>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
