import { motion } from 'framer-motion';

function MotionButton({ children, onClick }) {
  return (
    <motion.button
      whileHover={{ 
          scale: 1.05,
          transition: { duration: 0.1, ease: "easeOut" }
      }}
      whileTap={{ 
          scale: 0.95,
          transition: { duration: 0.1, ease: "easeIn" }
      }}
      onClick={onClick}
      className="px-10 py-4 bg-white text-slate-700 text-lg border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
  >
      {children}
  </motion.button>
  )
}
export default MotionButton;