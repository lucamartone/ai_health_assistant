import { motion } from 'framer-motion';

function MotionButton({ children, onClick, gradient}) {
  return (
    <motion.button
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.1, ease: 'easeOut' }
      }}
      whileTap={{
        scale: 0.95,
        transition: { duration: 0.1, ease: 'easeIn' }
      }}
      onClick={onClick}
      className={`w-full px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group`}
    >
      {children}
    </motion.button>
  );
}

export default MotionButton;
