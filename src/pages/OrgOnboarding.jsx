import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Building2, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createOrg, createOpportunity } from '../lib/firestore';

const DEMO_ORG = {
  name: 'Sunrise Senior Center',
  description: 'We serve 200+ seniors every weekend with hot meals, social events, and wellness programs. Our volunteers are the heart of everything we do.',
  location: 'Oakland, CA',
  address: '550 E Remington Dr, Sunnyvale, CA 94087',
  website: '',
  logoInitials: 'SSC',
  color: '#FB923C',
  isDemo: true,
};

const DEMO_OPPORTUNITIES = [
  {
    title: 'Weekend Meals Coordinator',
    description: 'Help prep and serve hot meals to seniors every Saturday morning. No experience needed — just a warm heart.',
    date: 'Every Saturday',
    time: '9am – 1pm',
    slots: 12,
    skills: ['Cooking', 'Admin'],
    impact: 'Help people directly',
  },
  {
    title: 'Senior Social Events Helper',
    description: 'Assist with bingo nights, movie screenings, and birthday celebrations for our residents.',
    date: 'Fridays',
    time: '2pm – 5pm',
    slots: 6,
    skills: ['Creative', 'Admin'],
    impact: 'Help people directly',
  },
  {
    title: 'Grocery Delivery Driver',
    description: 'Pick up and deliver weekly groceries to seniors who cannot leave their homes.',
    date: 'Flexible',
    time: '10am – 12pm',
    slots: 4,
    skills: ['Driving'],
    impact: 'Help people directly',
  },
];

export default function OrgOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // 'demo' | 'real'
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Real org form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');

  const handleDemo = async () => {
    setLoading(true);
    try {
      const orgId = user.uid;
      await createOrg(orgId, DEMO_ORG);
      for (const opp of DEMO_OPPORTUNITIES) {
        await createOpportunity({
          ...opp,
          orgId,
          orgName: DEMO_ORG.name,
          location: DEMO_ORG.location,
          address: DEMO_ORG.address,
          createdBy: user.uid,
        });
      }
      setDone(true);
      setTimeout(() => navigate('/coordinator'), 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleRealSubmit = async (e) => {
    e.preventDefault();
    if (!name || !description || !location) return;
    setLoading(true);
    const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    const colors = ['#4ADE80', '#FB923C', '#818CF8', '#34D399', '#F472B6'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    try {
      await createOrg(user.uid, {
        name, description, location, address, website,
        logoInitials: initials, color, isDemo: false,
      });
      setDone(true);
      setTimeout(() => navigate('/coordinator'), 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-16 h-16 rounded-full bg-primary-dim border-2 border-primary flex items-center justify-center"
          >
            <CheckCircle2 size={28} className="text-primary" />
          </motion.div>
          <h2 className="text-2xl font-semibold tracking-heading text-text-primary">You're set up.</h2>
          <p className="text-sm text-text-secondary">Taking you to your dashboard…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <div className="mb-10 text-center">
          <span className="text-base font-semibold tracking-heading text-text-primary">VolunteerConnect</span>
          <h1 className="text-2xl font-semibold tracking-heading mt-6 mb-2">Set up your organization</h1>
          <p className="text-sm text-text-secondary">
            Create a profile so volunteers can find your opportunities and sign up for shifts.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!mode && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="grid grid-cols-2 gap-4"
            >
              {/* Demo option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('demo')}
                className="flex flex-col gap-4 p-6 bg-surface-raised border-2 border-border rounded-card text-left hover:border-accent/60 transition-colors group"
              >
                <div className="w-10 h-10 rounded-btn bg-accent-dim/40 flex items-center justify-center">
                  <Sparkles size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">Use demo org</p>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Pre-filled with Sunrise Senior Center and 3 real sample opportunities. Perfect for demos.
                  </p>
                </div>
                <span className="text-xs text-accent font-medium mt-auto">
                  Ready in 1 click →
                </span>
              </motion.button>

              {/* Real option */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode('real')}
                className="flex flex-col gap-4 p-6 bg-surface-raised border-2 border-border rounded-card text-left hover:border-primary/60 transition-colors group"
              >
                <div className="w-10 h-10 rounded-btn bg-primary-dim/40 flex items-center justify-center">
                  <Building2 size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary mb-1">Real organization</p>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    Enter your actual org details and create real volunteer opportunities for your community.
                  </p>
                </div>
                <span className="text-xs text-primary font-medium mt-auto">
                  Set up my org →
                </span>
              </motion.button>
            </motion.div>
          )}

          {mode === 'demo' && (
            <motion.div
              key="demo"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-surface-raised border border-border rounded-card p-6 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-bg">SSC</div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Sunrise Senior Center</p>
                  <p className="text-xs text-text-tertiary">Oakland, CA · Demo organization</p>
                </div>
              </div>
              <p className="text-sm text-text-secondary">{DEMO_ORG.description}</p>
              <div className="space-y-2">
                <p className="text-xs text-text-tertiary uppercase tracking-wider">Comes with 3 sample opportunities</p>
                {DEMO_OPPORTUNITIES.map((o) => (
                  <div key={o.title} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="text-primary">•</span>
                    {o.title} — {o.date}, {o.time}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDemo}
                  disabled={loading}
                  className="flex-1 h-10 bg-accent text-bg rounded-btn font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? (
                    <motion.div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <><Zap size={14} /> Create demo org</>
                  )}
                </motion.button>
                <button onClick={() => setMode(null)} className="px-4 text-sm text-text-tertiary hover:text-text-secondary transition-colors">Back</button>
              </div>
            </motion.div>
          )}

          {mode === 'real' && (
            <motion.form
              key="real"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleRealSubmit}
              className="space-y-4"
            >
              {[
                { label: 'Organization name *', value: name, set: setName, placeholder: 'e.g. Oakland Food Bank' },
                { label: 'Location *', value: location, set: setLocation, placeholder: 'e.g. Oakland, CA' },
                { label: 'Address', value: address, set: setAddress, placeholder: 'e.g. 123 Main St, Oakland, CA 94601' },
                { label: 'Website', value: website, set: setWebsite, placeholder: 'https://...' },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <label className="text-xs text-text-tertiary uppercase tracking-wider">{f.label}</label>
                  <input
                    type="text"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full h-11 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-primary transition-colors"
                    style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                  />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-xs text-text-tertiary uppercase tracking-wider">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does your organization do? What kind of volunteers do you need?"
                  rows={3}
                  className="w-full bg-surface-raised border border-border rounded-card px-4 py-3 text-sm text-text-primary placeholder-text-tertiary outline-none resize-none focus:border-primary transition-colors"
                  style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={loading || !name || !description || !location}
                  className="flex-1 h-10 bg-primary text-bg rounded-btn font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? (
                    <motion.div className="w-4 h-4 border-2 border-bg/30 border-t-bg rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
                  ) : (
                    <><Building2 size={14} /> Create organization</>
                  )}
                </motion.button>
                <button type="button" onClick={() => setMode(null)} className="px-4 text-sm text-text-tertiary hover:text-text-secondary transition-colors">Back</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
