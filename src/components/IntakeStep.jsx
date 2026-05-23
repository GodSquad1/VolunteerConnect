import { motion } from 'framer-motion';

export default function IntakeStep({ children, step }) {
  return (
    <motion.div
      key={step}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      {children}
    </motion.div>
  );
}
