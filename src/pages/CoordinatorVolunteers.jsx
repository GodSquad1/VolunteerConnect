import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Clock, CheckCircle2, XCircle, Users, Check, X } from 'lucide-react';
import CoordinatorLayout from '../components/CoordinatorLayout';
import { useAuth } from '../context/AuthContext';
import { getOrgByUser, listenOrgSignups, approveSignup, rejectSignup } from '../lib/firestore';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#4ADE80', bg: '#052e16' },
  completed: { label: 'Completed', color: '#818CF8', bg: '#1e1b4b' },
  cancelled: { label: 'Cancelled', color: '#F87171', bg: '#450a0a' },
  pending: { label: 'Pending', color: '#FB923C', bg: '#431407' },
};

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
  const totalHours = signups.reduce((sum, s) => sum + (s.hoursLogged || 0), 0);

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
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors capitalize ${
                filterStatus === s
                  ? 'border-primary bg-primary-dim text-primary'
                  : 'border-border text-text-secondary hover:border-border-bright'
              }`}>
              {s === 'all' ? 'All' : s}
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
                  <th className="text-left px-4 py-3 text-xs text-text-tertiary font-medium">Hours logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s, i) => {
                  const st = statusConfig[s.status] || statusConfig.confirmed;
                  return (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="hover:bg-surface-raised transition-colors">
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
                      <td className="px-4 py-3 text-text-secondary">
                        {s.hoursLogged > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <Clock size={11} className="text-primary" />{s.hoursLogged}h
                          </span>
                        ) : '—'}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CoordinatorLayout>
  );
}
