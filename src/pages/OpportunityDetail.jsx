import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle2, LogIn } from 'lucide-react';
import { getOpportunity, signUpForOpportunity } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getOpportunity(id)
      .then((data) => setOpp(data))
      .catch(() => setOpp(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSignUp = async () => {
    if (!user || !opp) return;
    setSigning(true);
    try {
      await signUpForOpportunity(
        user.uid,
        user.displayName || user.email,
        user.email,
        opp.id,
        opp.orgId,
        opp.orgName,
        opp.title,
      );
      setDone(true);
      setTimeout(() => navigate('/volunteer/confirmed', { state: { opp } }), 900);
    } catch (err) {
      console.error(err);
      setSigning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
            animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
        ))}
      </div>
    </div>
  );

  if (!opp) return <div className="min-h-screen bg-bg flex items-center justify-center"><p className="text-text-secondary">Opportunity not found.</p></div>;

  const spotsLeft = (opp.slots || 0) - (opp.filledSlots || 0);

  return (
    <div className="min-h-screen bg-bg px-8 py-10 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors mb-8">
        <ArrowLeft size={14} /> Back to search
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Org header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary-dim flex items-center justify-center text-sm font-semibold text-primary">
            {opp.orgName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">{opp.orgName}</p>
            <p className="text-xs text-text-secondary">{opp.location}</p>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-heading text-text-primary mb-2">{opp.title}</h1>
          <p className="text-sm text-text-secondary leading-relaxed">{opp.description}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: opp.date + (opp.time ? ` · ${opp.time}` : '') },
            { icon: MapPin, label: opp.location || 'On-site' },
            { icon: Users, label: spotsLeft > 0 ? `${spotsLeft} spots left` : 'Full', color: spotsLeft > 0 ? '#FB923C' : '#F87171' },
          ].map((item, i) => (
            <div key={i} className="bg-surface border border-border rounded-card p-3 flex items-center gap-2">
              <item.icon size={14} style={{ color: item.color || '#4ADE80' }} className="shrink-0" />
              <span className="text-xs text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>

        {opp.skills?.length > 0 && (
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Skills helpful</p>
            <div className="flex flex-wrap gap-2">
              {opp.skills.map(s => <span key={s} className="text-xs px-3 py-1 bg-surface border border-border rounded-full text-text-secondary">{s}</span>)}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 bg-primary-dim/30 border border-primary/20 rounded-card">
              <CheckCircle2 size={18} className="text-primary" />
              <p className="text-sm text-primary font-medium">You're signed up! Redirecting…</p>
            </motion.div>
          ) : !user ? (
            <motion.div key="login" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="space-y-3">
              <p className="text-sm text-text-secondary text-center">Sign in to commit to this shift.</p>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/auth?role=volunteer&next=${encodeURIComponent(`/volunteer/opportunity/${id}`)}`)}
                className="w-full h-12 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <LogIn size={16} /> Sign in to volunteer
              </motion.button>
            </motion.div>
          ) : (
            <motion.button key="cta" whileTap={{ scale: 0.97 }} onClick={handleSignUp}
              disabled={signing || spotsLeft === 0}
              className="w-full h-12 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
              {signing ? 'Signing you up…' : spotsLeft === 0 ? 'This shift is full' : "I'm in — commit to this shift"}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
