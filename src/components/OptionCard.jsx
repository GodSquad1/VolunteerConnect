import { motion } from 'framer-motion';

export default function OptionCard({ icon: Icon, label, description, selected, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left p-5 rounded-card border-2 transition-colors ${
        selected
          ? 'border-primary bg-primary-dim/40'
          : 'border-border bg-surface hover:border-border-bright'
      }`}
    >
      <div className="flex flex-col gap-2">
        <div
          className="w-10 h-10 rounded-btn flex items-center justify-center"
          style={{
            backgroundColor: selected ? '#16532D' : '#1A1A1A',
          }}
        >
          <Icon size={20} style={{ color: selected ? '#4ADE80' : '#A3A3A3' }} />
        </div>
        <div>
          <p className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-text-primary'}`}>
            {label}
          </p>
          <p className="text-xs text-text-tertiary mt-0.5">{description}</p>
        </div>
      </div>
    </motion.button>
  );
}
