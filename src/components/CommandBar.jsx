import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const suggestedCommands = [
  'Fill my open gaps',
  "Who's likely to no-show this week?",
  'Send reminders for Saturday',
  'I need 10 volunteers by Friday',
];

const taskFeedItems = [
  { icon: '⚡', text: 'Scoring 23 available volunteers...', color: 'amber', delay: 0.4 },
  { icon: '✓', text: 'Top matches identified: Jordan, Priya, Sam', color: 'green', delay: 1.0 },
  { icon: '✓', text: 'Outreach sent to 3 volunteers', color: 'green', delay: 1.6 },
  { icon: '✓', text: 'Jordan Lee confirmed — slot 1 filled', color: 'green', delay: 2.2 },
  { icon: '✓', text: 'Priya Patel confirmed — slot 2 filled', color: 'green', delay: 2.8 },
  { icon: '✓', text: 'Sam Torres confirmed — slot 3 filled', color: 'green', delay: 3.4 },
];

export default function CommandBar({ onGapsFilled }) {
  const [inputValue, setInputValue] = useState('');
  const [activeCommand, setActiveCommand] = useState(null);
  const [showResponse, setShowResponse] = useState(false);
  const [visibleItems, setVisibleItems] = useState([]);
  const [allDone, setAllDone] = useState(false);
  const inputRef = useRef(null);

  const handlePillClick = (cmd) => {
    setActiveCommand(cmd);
    setInputValue(cmd);
    setShowResponse(false);
    setVisibleItems([]);
    setAllDone(false);
    inputRef.current?.focus();

    if (cmd === 'Fill my open gaps') {
      setTimeout(() => {
        setShowResponse(true);
        taskFeedItems.forEach((item, i) => {
          setTimeout(() => {
            setVisibleItems((prev) => [...prev, i]);
            if (i === taskFeedItems.length - 1) {
              setTimeout(() => {
                setAllDone(true);
                if (onGapsFilled) onGapsFilled();
              }, 600);
            }
          }, item.delay * 1000);
        });
      }, 800);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() === 'Fill my open gaps') {
      handlePillClick('Fill my open gaps');
    }
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
          onClick={handleSend}
          className="h-14 w-14 bg-primary rounded-card flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
        >
          <ArrowRight size={18} className="text-bg font-bold" />
        </motion.button>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestedCommands.map((cmd) => (
          <motion.button
            key={cmd}
            whileTap={{ scale: 0.96 }}
            onClick={() => handlePillClick(cmd)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeCommand === cmd
                ? 'border-primary bg-primary-dim text-primary'
                : 'border-border text-text-secondary hover:border-border-bright hover:text-text-primary'
            }`}
          >
            {cmd}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="bg-surface-raised border border-border rounded-card p-4 space-y-3"
          >
            <motion.p
              key={allDone ? 'done' : 'finding'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm font-medium"
              style={{ color: allDone ? '#4ADE80' : '#F5F5F5' }}
            >
              {allDone
                ? 'All gaps filled. Saturday is covered.'
                : 'Found 3 gaps in Saturday morning shift'}
            </motion.p>

            <div className="space-y-2">
              {taskFeedItems.map((item, i) => (
                <AnimatePresence key={i}>
                  {visibleItems.includes(i) && (
                    <motion.div
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="text-sm"
                        style={{ color: item.color === 'amber' ? '#FB923C' : '#4ADE80' }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-sm text-text-secondary">{item.text}</span>
                      {item.color === 'amber' && !visibleItems.includes(i + 1) && (
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="text-xs text-text-tertiary"
                        >
                          ...
                        </motion.span>
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
