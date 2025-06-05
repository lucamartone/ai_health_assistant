import { motion } from 'framer-motion';

function FeatureCard({ icon, title, description, buttonText, gradient, onClick }) {
    return (
    <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex-1 flex flex-col items-center text-center border border-slate-100 min-w-0"
    >
        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6`}>
            <svg className={`w-10 h-10 ${gradient.split(' ')[2]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        </div>
        <h3 className="text-2xl font-semibold text-slate-800 mb-4">{title}</h3>
        <p className="text-slate-600 text-base leading-relaxed mb-8">
            {description}
        </p>
        <motion.button
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full px-6 py-3 bg-gradient-to-r ${gradient} text-white rounded-xl hover:shadow-lg transition-all duration-300 shadow-sm flex items-center justify-center gap-2 group`}
        >
            {buttonText}
            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
            </svg>
        </motion.button>
    </motion.div>
    );
}

export default FeatureCard; 