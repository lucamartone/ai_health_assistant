import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';

function Index() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />,
            title: "Chat AI",
            description: "Assistenza immediata per qualsiasi domanda sulla salute.",
            buttonText: "Inizia a chattare",
            gradient: "from-violet-500 to-violet-600 text-violet-50",
            onClick: () => navigate('/chat')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Prenotazioni",
            description: "Prenota le tue visite mediche in pochi click. Scegli data e ora più comode per te.",
            buttonText: "Prenota ora",
            gradient: "from-rose-500 to-rose-600 text-rose-50",
            onClick: () => navigate('/book')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo",
            description: "Gestisci i tuoi dati e appuntamenti in un unico posto. Mantieni tutto sotto controllo.",
            buttonText: "Gestisci profilo",
            gradient: "from-amber-500 to-amber-600 text-amber-50",
            onClick: () => navigate('/profile')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
            {/* Hero Section with background image */}
            <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[540px] mb-12 rounded-b-2xl overflow-hidden">
                <img
                    src="/sfondo_index_1.png"
                    alt="Dottore"
                    className="absolute inset-0 w-full h-full object-cover object-right mt-16"
                />

                <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 sm:px-6 text-white text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-2xl"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight"
                        >
                            La tua salute è la nostra{' '}
                            <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-100"
                            >
                                priorità
                            </motion.span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                            className="text-md sm:text-lg max-w-xl leading-relaxed text-white"
                        >
                            Prenota visite mediche, consulta specialisti e ricevi assistenza immediata 
                            dal nostro chatbot AI. La tua salute è nelle mani giuste.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                            className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/register')}
                                className="px-6 py-2 bg-white text-blue-700 font-semibold text-sm sm:text-base rounded-xl shadow hover:bg-blue-50 transition-all"
                            >
                                Inizia Ora
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/login')}
                                className="px-6 py-2 border-2 border-white text-white font-semibold text-sm sm:text-base rounded-xl hover:bg-white/10 transition-all"
                            >
                                Accedi
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-10 sm:pt-2 sm:pb-30">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col md:flex-row justify-between items-stretch gap-6 sm:gap-8 w-full"
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
