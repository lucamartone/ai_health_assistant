import { motion } from 'framer-motion';

function MotionButton({ children, onClick, gradient}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }} // rimosso transition per effetto istantaneo
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1, ease: 'easeIn' }
      }}
      onClick={onClick}
      className="px-6 py-2 md:px-8 md:py-3 bg-white text-slate-700 text-sm md:text-base font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
    >
      {children}
    </motion.button>
  );
}

export default MotionButton;
