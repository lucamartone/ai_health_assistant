import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, description, buttonText, gradient, onClick }) => (
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

function Index() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
            title: "Chat AI",
            description: "Assistenza immediata per qualsiasi domanda sulla salute. Il nostro chatbot è disponibile 24/7 per aiutarti.",
            buttonText: "Inizia a chattare",
            gradient: "from-violet-100 to-violet-50 text-violet-600",
            onClick: () => navigate('/chat')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Prenotazioni",
            description: "Prenota le tue visite mediche in pochi click. Scegli data e ora più comode per te.",
            buttonText: "Prenota ora",
            gradient: "from-rose-100 to-rose-50 text-rose-600",
            onClick: () => navigate('/book')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo",
            description: "Gestisci i tuoi dati e appuntamenti in un unico posto. Mantieni tutto sotto controllo.",
            buttonText: "Gestisci profilo",
            gradient: "from-amber-100 to-amber-50 text-amber-600",
            onClick: () => navigate('/profile')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-6 py-32 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center relative z-10"
                >
                    <h1 className="text-6xl font-bold text-slate-800 mb-8 leading-tight">
                        La tua salute è la nostra
                        priorità
                    </h1>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                        Prenota visite mediche, consulta specialisti e ricevi assistenza immediata 
                        dal nostro chatbot AI. La tua salute è nelle mani giuste.
                    </p>
                    <div className="mt-12 flex justify-center gap-8">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/register')}
                            className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-lg rounded-xl hover:shadow-lg transition-all duration-300 shadow-md"
                        >
                            Inizia Ora
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/login')}
                            className="px-10 py-4 bg-white text-slate-700 text-lg border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            Accedi
                        </motion.button>
                    </div>
                </motion.div>   
            </div>

            {/* space between hero and features */}
            <div className="h-20"></div>
            
            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-6 py-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex flex-row justify-between items-stretch gap-8 w-full"
                >
                    {features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

export default Index;