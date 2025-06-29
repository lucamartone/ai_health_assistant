import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import FeatureCard from '../../components/FeatureCard';
import { useAuth } from '../../contexts/AuthContext';

function Index() {
    const navigate = useNavigate();
    const { account, loading } = useAuth();

    // Reindirizza al profilo se l'utente è già autenticato
    useEffect(() => {
        if (!loading && account) {
            navigate('/profile');
        }
    }, [account, loading, navigate]);

    const handleProfileClick = () => {
        if (account) {
            // Se l'utente è autenticato, vai al profilo
            navigate('/profile');
        } else {
            // Se l'utente non è autenticato, vai al login
            navigate('/login');
        }
    };

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
            onClick: handleProfileClick
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-400 to-blue-600">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 pb-20 sm:pb-25 relative overflow-hidden">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center relative z-10"
                >
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight"
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
                        className="text-lg sm:text-xl text-blue-50 max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        Prenota visite mediche, consulta specialisti e ricevi assistenza immediata 
                        dal nostro chatbot AI. La tua salute è nelle mani giuste.
                    </motion.p>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 px-4"
                    >
                        <motion.button
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            whileTap={{ 
                                scale: 0.95,
                                transition: { duration: 0.1, ease: "easeIn" }
                            }}
                            onClick={() => navigate('/register')}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-white text-blue-600 text-base sm:text-lg font-semibold rounded-xl hover:bg-blue-50 transition-all duration-500 shadow-lg hover:shadow-xl"
                        >
                            Inizia Ora
                        </motion.button>
                        <motion.button
                            whileHover={{ 
                                scale: 1.05,
                                transition: { duration: 0.2, ease: "easeOut" }
                            }}
                            whileTap={{ 
                                scale: 0.95,
                                transition: { duration: 0.1, ease: "easeIn" }
                            }}
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-4 bg-transparent text-white text-base sm:text-lg border-2 border-white rounded-xl hover:bg-white/10 transition-all duration-500"
                        >
                            Accedi
                        </motion.button>
                    </motion.div>
                </motion.div>
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