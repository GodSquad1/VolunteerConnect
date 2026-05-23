import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader, Copy, Check, ChevronDown, Mail } from 'lucide-react';
import { runCoordinatorCommand } from '../lib/gemini';

const suggestedCommands = [
  'Fill my open gaps',
  "Who's likely to no-show this week?",
  'Send reminders for Saturday',
  'I need 10 volunteers by Friday',
];

const statusColors = {
  done: '#4ADE80',
  pending: '#FB923C',
  alert: '#F87171',
};

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-btn border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors shrink-0">
      {copied ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
      {copied ? 'Copied' : label}
    </button>
  );
}

function OutreachPanel({ outreach }) {
  const [openIdx, setOpenIdx] = useState(0);
  if (!outreach?.length) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="mt-2 ml-6 border border-primary/20 rounded-card bg-surface overflow-hidden">
      {outreach.map((person, i) => (
        <div key={i} className={`${i > 0 ? 'border-t border-border' : ''}`}>
          <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface-raised transition-colors">
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-primary shrink-0" />
              <span className="text-sm font-medium text-text-primary">{person.name}</span>
              <span className="text-xs text-text-tertiary">{person.email}</span>
            </div>
            <ChevronDown size={12} className={`text-text-tertiary transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {openIdx === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden">
                <div className="px-3 pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-text-tertiary">Subject: <span className="text-text-secondary">{person.subject}</span></p>
                    <CopyButton value={person.email} label="Copy email" />
                  </div>
                  <div className="bg-surface-raised border border-border rounded-btn p-3">
                    <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">{person.body}</p>
                  </div>
                  <CopyButton value={`Subject: ${person.subject}\n\n${person.body}`} label="Copy message" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}

export default function CommandBar({ onGapsFilled, org, opportunities, signups }) {
  const [inputValue, setInputValue] = useState('');
  const [activeCommand, setActiveCommand] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [visibleActions, setVisibleActions] = useState([]);
  const inputRef = useRef(null);

  const handleSend = async (query = inputValue) => {
    const q = query.trim();
    if (!q) return;
    setInputValue(q);
    setActiveCommand(q);
    setIsLoading(true);
    setResponse(null);
    setError(null);
    setVisibleActions([]);

    try {
      const data = await runCoordinatorCommand(q, { org, opportunities, signups });
      setResponse(data);
      setIsLoading(false);

      // Stagger action items in
      data.actions.forEach((_, i) => {
        setTimeout(() => {
          setVisibleActions((prev) => [...prev, i]);
          if (i === data.actions.length - 1 && onGapsFilled) {
            const lower = q.toLowerCase();
            if (lower.includes('gap') || lower.includes('fill')) {
              setTimeout(onGapsFilled, 400);
            }
          }
        }, 300 + i * 280);
      });
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Check the console for details.');
      setIsLoading(false);
    }
  };

  const handlePillClick = (cmd) => {
    setInputValue(cmd);
    inputRef.current?.focus();
    handleSend(cmd);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-text-tertiary uppercase tracking-wider">What do you need?</p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="e.g. I have 3 gaps for tomorrow morning, fill them..."
            className="w-full h-14 bg-surface-raised border border-border rounded-card px-4 text-sm text-text-primary placeholder-text-tertiary outline-none transition-colors focus:border-primary"
            style={{ fontFamily: 'Instrument Sans, sans-serif' }}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleSend()}
          disabled={isLoading}
          className="h-14 w-14 bg-primary rounded-card flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader size={18} className="text-bg" />
            </motion.div>
          ) : (
            <ArrowRight size={18} className="text-bg" />
          )}
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedCommands.map((cmd) => (
          <motion.button
            key={cmd}
            whileTap={{ scale: 0.96 }}
            onClick={() => handlePillClick(cmd)}
            disabled={isLoading}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
              activeCommand === cmd
                ? 'border-primary bg-primary-dim text-primary'
                : 'border-border text-text-secondary hover:border-border-bright hover:text-text-primary'
            }`}
          >
            {cmd}
          </motion.button>
        ))}
      </div>

      {/* Loading skeleton */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-surface-raised border border-border rounded-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
                />
              ))}
              <span className="text-xs text-text-tertiary ml-1">Thinking...</span>
            </div>
            {[80, 60, 72, 55].map((w, i) => (
              <motion.div
                key={i}
                className="h-3 bg-border rounded-full"
                style={{ width: `${w}%` }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-surface-raised border border-red-900/50 rounded-card p-4"
          >
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Response */}
      <AnimatePresence>
        {response && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="bg-surface-raised border border-border rounded-card p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-sm font-medium text-text-primary">{response.summary}</p>
            </div>

            <div className="space-y-1.5">
              {response.actions.map((action, i) => (
                <AnimatePresence key={i}>
                  {visibleActions.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="flex items-center gap-2.5 py-1.5 px-3 rounded-btn bg-surface border border-border">
                        <span className="text-sm w-4 text-center shrink-0"
                          style={{ color: statusColors[action.status] || '#A3A3A3' }}>
                          {action.icon}
                        </span>
                        <span className="text-sm text-text-secondary flex-1">{action.text}</span>
                        {action.status === 'pending' && !action.outreach && (
                          <motion.span animate={{ opacity: [1, 0.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            className="ml-auto text-xs text-text-tertiary shrink-0">
                            •••
                          </motion.span>
                        )}
                      </div>
                      {action.outreach?.length > 0 && (
                        <OutreachPanel outreach={action.outreach} />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
