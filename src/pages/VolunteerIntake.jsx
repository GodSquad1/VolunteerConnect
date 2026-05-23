import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Heart, PawPrint, Leaf, BookOpen, LogOut } from 'lucide-react';
import IntakeStep from '../components/IntakeStep';
import OptionCard from '../components/OptionCard';
import { generateMatchNote } from '../lib/gemini';
import { useAuth } from '../context/AuthContext';

const impactOptions = [
  { icon: Heart, label: 'Help people directly', description: 'Work hands-on with people in need' },
  { icon: PawPrint, label: 'Work with animals', description: 'Support shelters and wildlife orgs' },
  { icon: Leaf, label: 'Protect the environment', description: 'Conservation and cleanup efforts' },
  { icon: BookOpen, label: 'Support education', description: 'Tutoring, mentorship, after-school' },
];

const skillTags = [
  'Teaching', 'Cooking', 'Driving', 'First Aid', 'Languages',
  'Tech', 'Music', 'Construction', 'Admin', 'Creative',
];

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const times = ['Morning', 'Afternoon', 'Evening'];

const loadingTexts = [
  'Reading your answers...',
  'Searching 47 opportunities...',
  'Found something.',
];

export default function VolunteerIntake() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 1
  const [selectedImpact, setSelectedImpact] = useState(null);
  // Step 2
  const [selectedSkills, setSelectedSkills] = useState([]);
  // Step 3
  const [availability, setAvailability] = useState({});
  // Step 4
  const [motivation, setMotivation] = useState('');

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);

  const canContinue = () => {
    if (step === 1) return selectedImpact !== null;
    if (step === 2) return selectedSkills.length > 0;
    if (step === 3) return Object.keys(availability).length > 0;
    if (step === 4) return motivation.trim().length > 0;
    return false;
  };

  const goNext = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleContinue = () => {
    if (!canContinue()) return;
    if (step < 4) goNext();
    else startLoading();
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  // Step 1: auto-advance after brief highlight delay
  const handleImpactSelect = (label) => {
    setSelectedImpact(label);
    setTimeout(() => goNext(), 320);
  };

  const startLoading = () => {
    setIsLoading(true);
    // Call Gemini to generate personalized match note in the background
    generateMatchNote({
      impact: selectedImpact,
      skills: selectedSkills,
      motivation,
    })
      .then((note) => {
        sessionStorage.setItem('matchNote', note);
      })
      .catch(() => {
        // Fallback to mock note if API fails — silently
      });

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < loadingTexts.length) {
        setLoadingTextIdx(idx);
      } else {
        clearInterval(interval);
        navigate('/volunteer/match');
      }
    }, 900);
  };

  const toggleAvailability = (day, time) => {
    const key = `${day}-${time}`;
    setAvailability((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = true;
      return next;
    });
  };

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingTextIdx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-lg text-text-secondary"
          >
            {loadingTexts[loadingTextIdx]}
          </motion.p>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Progress bar */}
      <div className="px-8 pt-8 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleBack}
              className={`flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-4">
              {user && (
                <span className="text-xs text-text-tertiary hidden sm:block">
                  {user.displayName || user.email}
                </span>
              )}
              <span className="text-xs text-text-tertiary">{step} of 4</span>
              <button
                onClick={async () => { await signOut(); navigate('/'); }}
                className="flex items-center gap-1 text-xs text-text-tertiary hover:text-text-secondary transition-colors"
                title="Sign out"
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full bg-primary rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <IntakeStep key="step1" step={1}>
              <h2 className="text-3xl font-semibold tracking-heading mb-8">
                What kind of impact do you want to have?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {impactOptions.map((opt) => (
                  <OptionCard
                    key={opt.label}
                    icon={opt.icon}
                    label={opt.label}
                    description={opt.description}
                    selected={selectedImpact === opt.label}
                    onClick={() => handleImpactSelect(opt.label)}
                  />
                ))}
              </div>
            </IntakeStep>
          )}

          {step === 2 && (
            <IntakeStep key="step2" step={2}>
              <h2 className="text-3xl font-semibold tracking-heading mb-8">
                What skills can you bring?
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillTags.map((skill) => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <motion.button
                      key={skill}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                        active
                          ? 'border-primary bg-primary-dim text-primary'
                          : 'border-border text-text-secondary hover:border-border-bright hover:text-text-primary'
                      }`}
                    >
                      {skill}
                    </motion.button>
                  );
                })}
              </div>
            </IntakeStep>
          )}

          {step === 3 && (
            <IntakeStep key="step3" step={3}>
              <h2 className="text-3xl font-semibold tracking-heading mb-8">
                When are you usually free?
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-16" />
                      {times.map((t) => (
                        <th key={t} className="text-xs text-text-tertiary font-medium pb-3 text-center">
                          {t}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day}>
                        <td className="text-xs text-text-secondary py-1 pr-4 font-medium">{day}</td>
                        {times.map((time) => {
                          const active = availability[`${day}-${time}`];
                          return (
                            <td key={time} className="py-1 px-2 text-center">
                              <motion.button
                                whileTap={{ scale: 0.92 }}
                                onClick={() => toggleAvailability(day, time)}
                                className={`w-full h-9 rounded-btn border transition-colors text-xs ${
                                  active
                                    ? 'bg-primary-dim border-primary text-primary font-medium'
                                    : 'bg-surface border-border text-text-tertiary hover:border-border-bright'
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </IntakeStep>
          )}

          {step === 4 && (
            <IntakeStep key="step4" step={4}>
              <h2 className="text-3xl font-semibold tracking-heading mb-8">
                Tell us one thing that matters to you.
              </h2>
              <div className="relative">
                <textarea
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="e.g. My dad had Alzheimer's. My neighborhood needs more green spaces."
                  maxLength={400}
                  rows={5}
                  className="w-full bg-surface-raised border border-border rounded-card p-4 text-sm text-text-primary placeholder-text-tertiary outline-none resize-none transition-colors focus:border-primary"
                  style={{ fontFamily: 'Instrument Sans, sans-serif' }}
                />
                <span className="absolute bottom-3 right-3 text-xs text-text-tertiary">
                  {motivation.length}/400
                </span>
              </div>
            </IntakeStep>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button — hidden on step 1 (auto-advances) */}
      <div className="px-8 pb-12">
        <div className="max-w-2xl mx-auto">
          {step === 1 ? (
            <p className="text-xs text-text-tertiary">Select an option to continue</p>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleContinue}
              disabled={!canContinue()}
              className={`flex items-center gap-2 px-6 py-3 rounded-btn font-semibold text-sm transition-all ${
                canContinue()
                  ? 'bg-primary text-bg hover:opacity-90'
                  : 'bg-surface border border-border text-text-tertiary cursor-not-allowed'
              }`}
            >
              {step === 4 ? 'Find my match' : 'Continue'}
              <ArrowRight size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
