import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Clock, CheckCircle2, Users, Check, X, ChevronDown } from 'lucide-react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import { useAuth } from '../context/AuthContext';
import { getOrgByUser, listenOrgSignups, approveSignup, rejectSignup, approveHours, rejectHours } from '../lib/firestore';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#4ADE80', bg: '#052e16' },
  completed: { label: 'Completed', color: '#818CF8', bg: '#1e1b4b' },
  cancelled: { label: 'Cancelled', color: '#F87171', bg: '#450a0a' },
  pending: { label: 'Pending', color: '#FB923C', bg: '#431407' },
  hours_pending: { label: 'Hours review', color: '#FB923C', bg: '#431407' },
};

function HoursCell({ signup: s }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(s.hoursPending || s.hoursLogged || ''));

  if (s.status === 'hours_pending') {
    return (
      <div className="space-y-1.5">
        {editing ? (
          <div className="flex items-center gap-1.5">
            <input type="number" min="0.5" step="0.5" value={val} onChange={e => setVal(e.target.value)}
              className="w-16 h-7 bg-surface-raised border border-primary rounded-btn px-2 text-xs text-text-primary outline-none" autoFocus />
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { approveHours(s.id, Number(val)); setEditing(false); }}
              className="flex items-center gap-0.5 text-xs px-2 py-1 bg-primary/10 border border-primary/30 text-primary rounded-btn hover:bg-primary/20 transition-colors">
              <Check size={10} /> Approve
            </motion.button>
            <button onClick={() => setEditing(false)} className="text-xs text-text-tertiary hover:text-text-secondary">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-secondary" style={{ color: '#FB923C' }}>
              <Clock size={11} className="inline mr-1" style={{ color: '#FB923C' }} />
              {s.hoursPending || s.hoursLogged}h submitted
            </span>
          </div>
        )}
        {!editing && (
          <div className="flex gap-1.5">
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => approveHours(s.id, s.hoursPending || s.hoursLogged)}
              className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 border border-primary/30 text-primary rounded-btn hover:bg-primary/20 transition-colors">
              <Check size={10} /> Approve
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setEditing(true)}
              className="text-xs px-2 py-1 border border-border text-text-tertiary rounded-btn hover:border-border-bright hover:text-text-primary transition-colors">
              Edit
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => rejectHours(s.id)}
              className="flex items-center gap-1 text-xs px-2 py-1 border border-border text-text-tertiary rounded-btn hover:border-red-900/50 hover:text-red-400 transition-colors">
              <X size={10} /> Reject
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return s.hoursLogged > 0 ? (
    <span className="flex items-center gap-1.5 text-text-secondary">
      <Clock size={11} className="text-primary" />{s.hoursLogged}h
    </span>
  ) : <span className="text-text-tertiary">—</span>;
}

export default function CoordinatorVolunteers() {
  const { user } = useAuth();
  const [org, setOrg] = useState(null);
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user) return;
    getOrgByUser(user.uid).then(setOrg).catch(() => {});
    const unsub = listenOrgSignups(user.uid, (docs) => {
      setSignups(docs);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const filtered = signups.filter((s) => {
    const matchesQuery =
      !query ||
      s.userName?.toLowerCase().includes(query.toLowerCase()) ||
      s.userEmail?.toLowerCase().includes(query.toLowerCase()) ||
      s.oppTitle?.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  const confirmed = signups.filter((s) => s.status === 'confirmed').length;
  const completed = signups.filter((s) => s.status === 'completed').length;
  const pending = signups.filter((s) => s.status === 'pending').length;
  const hoursPending = signups.filter((s) => s.status === 'hours_pending').length;
  const totalHours = signups.reduce((sum, s) => sum + (s.hoursLogged || 0), 0);

  // Per-volunteer hour totals (approved only)
  const volunteerHours = Object.values(
    signups.reduce((acc, s) => {
      if (!s.userId) return acc;
      if (!acc[s.userId]) acc[s.userId] = { name: s.userName || s.userEmail, email: s.userEmail, hours: 0 };
      if (s.status === 'completed') acc[s.userId].hours += s.hoursLogged || 0;
      return acc;
    }, {})
  ).filter(v => v.hours > 0).sort((a, b) => b.hours - a.hours);

  return (
    <CoordinatorLayout org={org}>
      <div className="px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-heading text-text-primary">Volunteers</h1>
          <p className="text-sm text-text-secondary mt-0.5">Everyone who has signed up for your opportunities.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, value: confirmed, label: 'Active volunteers', color: '#4ADE80' },
            { icon: Clock, value: pending, label: 'Pending approval', color: '#FB923C' },
            { icon: CheckCircle2, value: `${totalHours}h`, label: 'Total hours logged', color: '#818CF8' },
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

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, shift…"
              className="w-full h-9 bg-surface border border-border rounded-btn pl-9 pr-3 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-primary transition-colors"
            />
          </div>
          {['all', 'confirmed', 'pending', 'hours_pending', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterStatus === s
                  ? 'border-primary bg-primary-dim text-primary'
                  : 'border-border text-text-secondary hover:border-border-bright'
              }`}>
              {s === 'all' ? 'All' : s === 'hours_pending' ? `Hours review${hoursPending > 0 ? ` (${hoursPending})` : ''}` : s}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex gap-2 justify-center py-16">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-surface border border-border rounded-card p-12 text-center">
            <Users size={28} className="mx-auto text-text-tertiary mb-3" />
            <p className="text-sm text-text-secondary">
              {signups.length === 0 ? 'No volunteers yet. Share your opportunities to get sign-ups.' : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Volunteer</th>
                  <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Shift</th>
                  <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s, i) => {
                  const st = statusConfig[s.status] || statusConfig.confirmed;
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-surface-raised transition-colors align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">{s.userName || '—'}</p>
                        <p className="text-xs text-text-tertiary flex items-center gap-1 mt-0.5">
                          <Mail size={10} />{s.userEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{s.oppTitle}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ color: st.color, backgroundColor: st.bg }}>
                          {st.label}
                        </span>
                        {s.status === 'pending' && (
                          <div className="flex gap-1.5 mt-1.5">
                            <motion.button whileTap={{ scale: 0.95 }}
                              onClick={() => approveSignup(s.id, s.opportunityId)}
                              className="flex items-center gap-1 text-xs px-2 py-1 bg-primary/10 border border-primary/30 text-primary rounded-btn hover:bg-primary/20 transition-colors">
                              <Check size={10} /> Approve
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.95 }}
                              onClick={() => rejectSignup(s.id)}
                              className="flex items-center gap-1 text-xs px-2 py-1 border border-border text-text-tertiary rounded-btn hover:border-red-900/50 hover:text-red-400 transition-colors">
                              <X size={10} /> Reject
                            </motion.button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <HoursCell signup={s} />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Per-volunteer hours summary */}
        {volunteerHours.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-3">Hours by volunteer</h2>
            <div className="bg-surface border border-border rounded-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Volunteer</th>
                    <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Total approved hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {volunteerHours.map((v, i) => (
                    <tr key={i} className="hover:bg-surface-raised transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-text-primary">{v.name}</p>
                        <p className="text-xs text-text-tertiary">{v.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-primary font-semibold">
                          <Clock size={12} />{v.hours}h
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}
