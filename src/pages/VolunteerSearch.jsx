import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Users, ArrowLeft, Navigation } from 'lucide-react';
import { getAllOpportunities } from '../lib/firestore';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Help people directly', 'Work with animals', 'Protect the environment', 'Support education'];
const DISTANCE_OPTIONS = [
  { label: 'Any distance', max: Infinity },
  { label: 'Within 5 mi', max: 5 },
  { label: 'Within 10 mi', max: 10 },
  { label: 'Within 25 mi', max: 25 },
  { label: 'Within 50 mi', max: 50 },
];

function haversine(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocode(locationStr) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationStr)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data[0]) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

export default function VolunteerSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState(Infinity);
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle'); // idle | loading | granted | denied
  const [distances, setDistances] = useState({}); // oppId -> miles
  const geocodeCache = useRef({});

  useEffect(() => {
    getAllOpportunities()
      .then((data) => setOpps(data))
      .catch(() => setOpps([]))
      .finally(() => setLoading(false));
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) { setLocationStatus('denied'); return; }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setLocationStatus('granted');
      },
      () => setLocationStatus('denied')
    );
  }, []);

  // Geocode opportunity locations and compute distances when we have user coords
  useEffect(() => {
    if (!userCoords || opps.length === 0) return;
    const compute = async () => {
      const newDistances = {};
      for (const opp of opps) {
        if (!opp.location) continue;
        if (!geocodeCache.current[opp.location]) {
          geocodeCache.current[opp.location] = await geocode(opp.location);
          // Respect Nominatim rate limit
          await new Promise(r => setTimeout(r, 200));
        }
        const coords = geocodeCache.current[opp.location];
        if (coords) {
          newDistances[opp.id] = haversine(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
        }
      }
      setDistances(prev => ({ ...prev, ...newDistances }));
    };
    compute();
  }, [userCoords, opps]);

  const filtered = opps.filter((o) => {
    const matchesQuery =
      !query ||
      o.title?.toLowerCase().includes(query.toLowerCase()) ||
      o.orgName?.toLowerCase().includes(query.toLowerCase()) ||
      o.description?.toLowerCase().includes(query.toLowerCase()) ||
      o.location?.toLowerCase().includes(query.toLowerCase());
    const matchesCat = category === 'All' || o.impact === category;
    const matchesDist = distanceFilter === Infinity || distances[o.id] === undefined || distances[o.id] <= distanceFilter;
    return matchesQuery && matchesCat && matchesDist && o.status !== 'closed';
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-border px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            <ArrowLeft size={14} /> Home
          </button>
          <span className="text-base font-semibold tracking-heading text-text-primary">VolunteerConnect</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/volunteer/dashboard')} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            My commitments
          </button>
          <button onClick={() => navigate('/volunteer/intake')} className="px-4 py-2 bg-primary text-bg rounded-btn text-sm font-semibold hover:opacity-90 transition-opacity">
            Get matched by AI
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="text-2xl font-semibold tracking-heading mb-1">Find opportunities</h1>
          <p className="text-sm text-text-secondary mb-7">Real volunteer opportunities from local organizations.</p>

          {/* Search bar */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, org, location…"
              className="w-full h-12 bg-surface-raised border border-border rounded-card pl-10 pr-4 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-primary transition-colors"
              style={{ fontFamily: 'Instrument Sans, sans-serif' }}
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  category === cat
                    ? 'border-primary bg-primary-dim text-primary'
                    : 'border-border text-text-secondary hover:border-border-bright'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Distance filter row */}
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {locationStatus === 'idle' && (
              <motion.button whileTap={{ scale: 0.96 }} onClick={requestLocation}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors">
                <Navigation size={11} /> Enable location to filter by distance
              </motion.button>
            )}
            {locationStatus === 'loading' && (
              <span className="text-xs text-text-tertiary flex items-center gap-1.5">
                <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Navigation size={11} />
                </motion.span>
                Getting your location…
              </span>
            )}
            {locationStatus === 'denied' && (
              <span className="text-xs text-red-400">Location access denied — distance filter unavailable</span>
            )}
            {locationStatus === 'granted' && DISTANCE_OPTIONS.map((opt) => (
              <motion.button key={opt.label} whileTap={{ scale: 0.96 }}
                onClick={() => setDistanceFilter(opt.max)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  distanceFilter === opt.max
                    ? 'border-primary bg-primary-dim text-primary'
                    : 'border-border text-text-secondary hover:border-border-bright'
                }`}>
                {opt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex gap-2 justify-center py-16">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-secondary text-sm mb-2">No opportunities found.</p>
            <p className="text-text-tertiary text-xs">Try a different search or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((opp, i) => {
              const filled = opp.filledSlots || 0;
              const spotsLeft = (opp.slots || 0) - filled;
              const initials = opp.orgName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'VC';
              return (
                <motion.div
                  key={opp.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-surface border border-border rounded-card p-5 flex flex-col gap-3 hover:border-border-bright transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-dim flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary leading-snug">{opp.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{opp.orgName}</p>
                    </div>
                  </div>

                  <p className="text-xs text-text-tertiary leading-relaxed line-clamp-2">{opp.description}</p>

                  <div className="flex flex-col gap-1 text-xs text-text-secondary">
                    {opp.date && <span className="flex items-center gap-1.5"><Calendar size={11} className="text-primary shrink-0" />{opp.date}{opp.time ? ` · ${opp.time}` : ''}</span>}
                    {opp.location && <span className="flex items-center gap-1.5"><MapPin size={11} className="text-primary shrink-0" />{opp.location}{distances[opp.id] !== undefined ? <span className="text-text-tertiary">· {distances[opp.id] < 1 ? '< 1' : distances[opp.id].toFixed(1)} mi away</span> : null}</span>}
                    <span className="flex items-center gap-1.5">
                      <Users size={11} style={{ color: spotsLeft === 0 ? '#F87171' : '#FB923C' }} />
                      <span style={{ color: spotsLeft === 0 ? '#F87171' : '#FB923C' }}>
                        {spotsLeft === 0 ? 'Full' : `${spotsLeft} spots left`}
                      </span>
                    </span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    disabled={spotsLeft === 0}
                    onClick={() => navigate(`/volunteer/opportunity/${opp.id}`)}
                    className="w-full h-9 bg-primary text-bg rounded-btn text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 mt-auto"
                  >
                    {spotsLeft === 0 ? 'Full' : 'View & sign up'}
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
