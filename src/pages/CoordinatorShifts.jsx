import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Users, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import { useAuth } from '../context/AuthContext';
import {
  getOrgByUser, listenOrgOpportunities, listenOrgSignups,
  createOpportunity, getOrgOpportunities,
} from '../lib/firestore';

export default function CoordinatorShifts() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | open | full

  useEffect(() => {
    if (!user) return;
    getOrgByUser(user.uid).then(setOrg).catch(() => {});
    getOrgOpportunities(user.uid).then((docs) => { setOpportunities(docs); setLoading(false); }).catch(() => setLoading(false));
    const unsubOpps = listenOrgOpportunities(user.uid, (docs) => {
      setOpportunities(docs);
      setLoading(false);
    });
    const unsubSignups = listenOrgSignups(user.uid, setSignups);
    return () => { unsubOpps(); unsubSignups(); };
  }, [user]);

  const filtered = opportunities.filter((o) => {
    if (filter === 'open') return (o.slots || 0) > (o.filledSlots || 0);
    if (filter === 'full') return (o.filledSlots || 0) >= (o.slots || 1);
    return true;
  });

  const totalSlots = opportunities.reduce((s, o) => s + (o.slots || 0), 0);
  const totalFilled = opportunities.reduce((s, o) => s + (o.filledSlots || 0), 0);

  return (
    <CoordinatorLayout org={org}>
      <div className="px-8 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-heading text-text-primary">Shifts</h1>
            <p className="text-sm text-text-secondary mt-0.5">All volunteer opportunities you've posted.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Calendar, value: opportunities.length, label: 'Total shifts', color: '#4ADE80' },
            { icon: Users, value: totalFilled, label: 'Spots filled', color: '#FB923C' },
            { icon: CheckCircle2, value: totalSlots ? `${Math.round((totalFilled / totalSlots) * 100)}%` : '0%', label: 'Fill rate', color: '#818CF8' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-surface border border-border rounded-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-heading" style={{ color: s.color }}>{s.value}</p>
                <p className="text-xs text-text-tertiary">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All shifts' },
            { key: 'open', label: 'Open' },
            { key: 'full', label: 'Full' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filter === key
                  ? 'border-primary bg-primary-dim text-primary'
                  : 'border-border text-text-secondary hover:border-border-bright'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Shift cards */}
        {loading ? (
          <div className="flex gap-2 justify-center py-16">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-card p-12 text-center">
            <Calendar size={28} className="mx-auto text-text-tertiary mb-3" />
            <p className="text-sm text-text-secondary mb-4">
              {opportunities.length === 0
                ? 'No shifts yet. Create your first opportunity from the Dashboard.'
                : 'No shifts match this filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((opp, i) => {
              const filled = opp.filledSlots || 0;
              const pct = opp.slots ? Math.round((filled / opp.slots) * 100) : 0;
              const isFull = filled >= (opp.slots || 1);
              const oppSignups = signups.filter(s => s.opportunityId === opp.id && s.status === 'confirmed');

              return (
                <motion.div key={opp.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-surface border border-border rounded-card p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-text-primary">{opp.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          isFull ? 'bg-red-900/30 text-red-400' : 'bg-primary-dim text-primary'
                        }`}>
                          {isFull ? 'Full' : 'Open'}
                        </span>
                      </div>
                      <p className="text-xs text-text-tertiary mt-0.5 line-clamp-1">{opp.description}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0" style={{ color: isFull ? '#F87171' : '#FB923C' }}>
                      {filled}/{opp.slots}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
                    {opp.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={11} className="text-primary" />
                        {opp.date}{opp.time ? ` · ${opp.time}` : ''}
                      </span>
                    )}
                    {opp.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={11} className="text-primary" />
                        {opp.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Users size={11} className="text-primary" />
                      {oppSignups.length} confirmed volunteer{oppSignups.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Fill bar */}
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isFull ? '#F87171' : '#4ADE80' }} />
                  </div>

                  {/* Volunteer chips */}
                  {oppSignups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {oppSignups.slice(0, 6).map(s => (
                        <span key={s.id} className="text-xs bg-surface-raised border border-border px-2 py-0.5 rounded-full text-text-secondary">
                          {s.userName || s.userEmail}
                        </span>
                      ))}
                      {oppSignups.length > 6 && (
                        <span className="text-xs text-text-tertiary self-center">+{oppSignups.length - 6} more</span>
                      )}
                    </div>
                  )}

                  {opp.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {opp.skills.map(sk => (
                        <span key={sk} className="text-xs px-2 py-0.5 bg-surface-raised border border-border rounded-full text-text-tertiary">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}
