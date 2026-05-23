import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { listenUserSignups, getUserSignups, logHours, cancelSignup } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#4ADE80', bg: '#16532D' },
  completed: { label: 'Completed', color: '#818CF8', bg: '#1e1b4b' },
  cancelled: { label: 'Cancelled', color: '#F87171', bg: '#450a0a' },
};

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [signups, setSignups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingId, setLoggingId] = useState(null);
  const [hours, setHours] = useState('');

  const refresh = () => getUserSignups(user?.uid).then((d) => { setSignups(d); setLoading(false); }).catch(() => setLoading(false));

  useEffect(() => {
    if (!user) return;
    // One-time fetch first so loading resolves quickly
    getUserSignups(user.uid).then((d) => { setSignups(d); setLoading(false); }).catch(() => setLoading(false));
    // Then layer on real-time listener
    const unsub = listenUserSignups(user.uid, (docs) => {
      setSignups(docs);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const totalHours = signups.reduce((s, sg) => s + (sg.hoursLogged || 0), 0);
  const confirmed = signups.filter(s => s.status === 'confirmed').length;
  const completed = signups.filter(s => s.status === 'completed').length;

  const handleLogHours = async (signupId) => {
    if (!hours || isNaN(hours)) return;
    await logHours(signupId, Number(hours));
    setLoggingId(null);
    setHours('');
    // listener auto-updates signups
  };

  const handleCancel = async (signupId, oppId) => {
    await cancelSignup(signupId, oppId);
    // listener auto-updates signups
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/volunteer/search')} className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            <ArrowLeft size={14} /> Browse opportunities
          </button>
          <span className="text-base font-semibold tracking-heading text-text-primary">VolunteerConnect</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold tracking-heading mb-1">My commitments</h1>
          <p className="text-sm text-text-secondary mb-8">Track your volunteer hours and upcoming shifts.</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { value: confirmed, label: 'Upcoming shifts' },
              { value: completed, label: 'Completed' },
              { value: `${totalHours}h`, label: 'Hours logged' },
            ].map((s, i) => (
              <div key={i} className="bg-surface border border-border rounded-card p-4 text-center">
                <p className="text-3xl font-semibold tracking-heading text-primary">{s.value}</p>
                <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex gap-2 justify-center py-12">
              {[0,1,2].map(i => (
                <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
              ))}
            </div>
          ) : signups.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-card bg-surface">
              <p className="text-sm text-text-secondary mb-3">No commitments yet.</p>
              <button onClick={() => navigate('/volunteer/search')} className="px-4 py-2 bg-primary text-bg rounded-btn text-sm font-semibold">
                Find opportunities
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {signups.map((sg, i) => {
                const status = statusConfig[sg.status] || statusConfig.confirmed;
                return (
                  <motion.div key={sg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-surface border border-border rounded-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{sg.oppTitle}</p>
                        <p className="text-xs text-text-secondary mt-0.5">{sg.orgName}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                        style={{ color: status.color, backgroundColor: status.bg }}>
                        {status.label}
                      </span>
                    </div>

                    {sg.hoursLogged > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock size={11} className="text-primary" />
                        {sg.hoursLogged} hours logged
                      </div>
                    )}

                    {/* Actions */}
                    {sg.status === 'confirmed' && (
                      <div className="flex gap-2">
                        {loggingId === sg.id ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={hours}
                              onChange={(e) => setHours(e.target.value)}
                              placeholder="Hours"
                              className="w-24 h-8 bg-surface-raised border border-border rounded-btn px-3 text-sm text-text-primary outline-none focus:border-primary"
                              autoFocus
                            />
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleLogHours(sg.id)}
                              className="h-8 px-3 bg-primary text-bg rounded-btn text-xs font-semibold">
                              Save
                            </motion.button>
                            <button onClick={() => setLoggingId(null)} className="text-xs text-text-tertiary hover:text-text-secondary">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setLoggingId(sg.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised border border-border rounded-btn text-xs text-text-secondary hover:border-border-bright hover:text-text-primary transition-colors">
                              <Clock size={11} /> Log hours
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.97 }} onClick={() => handleCancel(sg.id, sg.opportunityId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-btn text-xs text-text-tertiary hover:border-red-900/50 hover:text-red-400 transition-colors">
                              <XCircle size={11} /> Cancel
                            </motion.button>
                          </>
                        )}
                      </div>
                    )}

                    {sg.status === 'completed' && (
                      <div className="flex items-center gap-2 text-xs text-text-tertiary">
                        <CheckCircle2 size={12} className="text-primary" />
                        Completed · {sg.hoursLogged || 0}h logged
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
