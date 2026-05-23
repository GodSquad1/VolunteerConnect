import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Calendar, MapPin } from 'lucide-react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import StatCard from '../components/StatCard';
import CommandBar from '../components/CommandBar';
import { useAuth } from '../context/AuthContext';
import {
  getOrgByUser, createOpportunity,
  listenOrgOpportunities, listenOrgSignups,
} from '../lib/firestore';

function CreateOpportunityModal({ orgId, orgName, location, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState(10);
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !date) return;
    setLoading(true);
    try {
      await createOpportunity({
        orgId, orgName, location,
        title, description, date, time,
        slots: Number(slots),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        impact: 'Help people directly',
        createdBy: orgId,
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-surface-raised border border-border rounded-card p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-text-primary">New opportunity</h2>
          <button onClick={onClose}><X size={16} className="text-text-tertiary hover:text-text-secondary" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[
            { label: 'Title *', value: title, set: setTitle, placeholder: 'e.g. Weekend Meals Coordinator' },
            { label: 'Date *', value: date, set: setDate, placeholder: 'e.g. Every Saturday, or May 31' },
            { label: 'Time', value: time, set: setTime, placeholder: 'e.g. 9am – 1pm' },
            { label: 'Skills needed (comma-separated)', value: skills, set: setSkills, placeholder: 'e.g. Cooking, Admin' },
          ].map((f) => (
            <div key={f.label} className="space-y-1">
              <label className="text-xs text-text-tertiary">{f.label}</label>
              <input
                type="text"
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                placeholder={f.placeholder}
                className="w-full h-10 bg-surface border border-border rounded-btn px-3 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-primary transition-colors"
                style={{ fontFamily: 'Instrument Sans, sans-serif' }}
              />
            </div>
          ))}
          <div className="space-y-1">
            <label className="text-xs text-text-tertiary">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role and what volunteers will do..."
              rows={3}
              className="w-full bg-surface border border-border rounded-btn px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none resize-none focus:border-primary transition-colors"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-text-tertiary">Volunteer slots</label>
            <input
              type="number"
              min={1}
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              className="w-28 h-10 bg-surface border border-border rounded-btn px-3 text-sm text-text-primary outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading || !title || !description || !date}
              className="flex-1 h-10 bg-primary text-bg rounded-btn font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Creating…' : 'Create opportunity'}
            </motion.button>
            <button type="button" onClick={onClose} className="px-4 text-sm text-text-tertiary hover:text-text-secondary transition-colors">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const dotColors = { confirmed: '#4ADE80', cancelled: '#F87171', completed: '#818CF8' };

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [signups, setSignups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getOrgByUser(user.uid)
      .then((o) => setOrg(o))
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubOpps = listenOrgOpportunities(user.uid, setOpportunities);
    const unsubSignups = listenOrgSignups(user.uid, setSignups);
    return () => { unsubOpps(); unsubSignups(); };
  }, [user]);

  const totalSlots = opportunities.reduce((s, o) => s + (o.slots || 0), 0);
  const totalFilled = opportunities.reduce((s, o) => s + (o.filledSlots || 0), 0);
  const fillRate = totalSlots ? Math.round((totalFilled / totalSlots) * 100) : 0;
  const openGaps = totalSlots - totalFilled;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex gap-2">
          {[0,1,2].map(i => (
            <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <CoordinatorLayout org={org}>
      <div className="px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-heading text-text-primary">
              {org?.name || 'Dashboard'}
            </h1>
            {org?.location && (
              <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1">
                <MapPin size={12} />{org.location}
              </p>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-bg rounded-btn font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={15} /> New opportunity
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { value: signups.filter(s => s.status === 'confirmed').length, label: 'Active volunteers' },
            { value: opportunities.length, label: 'Opportunities posted' },
            { value: openGaps, label: 'Open gaps', accent: true },
            { value: `${fillRate}%`, label: 'Fill rate' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <StatCard value={s.value} label={s.label} accent={s.accent} />
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: '60% 1fr' }}>
          {/* Opportunities */}
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4">Your opportunities</h2>
            {opportunities.length === 0 ? (
              <div className="bg-surface border border-border rounded-card p-8 text-center">
                <p className="text-sm text-text-tertiary mb-3">No opportunities yet.</p>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)}
                  className="px-4 py-2 bg-primary text-bg rounded-btn text-sm font-semibold">
                  Create your first one
                </motion.button>
              </div>
            ) : (
              <div className="space-y-2">
                {opportunities.map((opp) => {
                  const filled = opp.filledSlots || 0;
                  const pct = opp.slots ? Math.round((filled / opp.slots) * 100) : 0;
                  const oppSignups = signups.filter(s => s.opportunityId === opp.id && s.status === 'confirmed');
                  return (
                    <motion.div key={opp.id} layout
                      className="bg-surface border border-border rounded-card p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-text-primary">{opp.title}</p>
                          <p className="text-xs text-text-tertiary">{opp.date}{opp.time ? ` · ${opp.time}` : ''}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${pct === 100 ? 'bg-primary-dim text-primary' : 'bg-accent-dim text-accent'}`}>
                          {filled}/{opp.slots} filled
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: pct === 100 ? '#4ADE80' : '#FB923C' }} />
                      </div>
                      {oppSignups.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {oppSignups.slice(0, 5).map(s => (
                            <span key={s.id} className="text-xs bg-surface-raised border border-border px-2 py-0.5 rounded-full text-text-secondary">
                              {s.userName || s.userEmail}
                            </span>
                          ))}
                          {oppSignups.length > 5 && (
                            <span className="text-xs text-text-tertiary">+{oppSignups.length - 5} more</span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Live sign-up feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-text-primary">Live sign-ups</h2>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div className="bg-surface border border-border rounded-card px-4 py-3 divide-y divide-border max-h-80 overflow-y-auto">
              {signups.length === 0 ? (
                <p className="text-xs text-text-tertiary py-4 text-center">Sign-ups will appear here in real time.</p>
              ) : (
                signups.slice(0, 15).map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 py-2">
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0"
                      style={{ backgroundColor: dotColors[s.status] || '#4ADE80' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">
                        <span className="font-medium">{s.userName || s.userEmail}</span>
                        {' '}signed up for{' '}
                        <span className="text-text-secondary">{s.oppTitle}</span>
                      </p>
                      <p className="text-xs text-text-tertiary capitalize">{s.status}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Command Bar */}
        <div className="bg-surface border border-border rounded-card p-6">
          <CommandBar />
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <CreateOpportunityModal
            orgId={user.uid}
            orgName={org?.name}
            location={org?.location}
            onClose={() => setShowModal(false)}
            onCreated={() => {}}
          />
        )}
      </AnimatePresence>
    </CoordinatorLayout>
  );
}
