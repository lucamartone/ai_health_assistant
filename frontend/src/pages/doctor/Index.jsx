import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import FeatureCard from '../../components/FeatureCard';
import { useAuth } from '../../contexts/AuthContext';

function Index() {
    const navigate = useNavigate();
    const { account, loading } = useAuth();

    useEffect(() => {
        if (!loading && account) {
            navigate('/doctor/profile');
        }
    }, [account, loading, navigate]);

    const handleProfileClick = () => {
        if (account) {
            // Se il dottore è autenticato, vai al profilo
            navigate('/doctor/profile');
        } else {
            // Se il dottore non è autenticato, vai al login
            navigate('/doctor/login');
        }
    };

    const features = [
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
            title: "Gestione Appuntamenti",
            description: "Visualizza e gestisci il tuo calendario di appuntamenti.",
            buttonText: "Gestisci appuntamenti",
            gradient: "from-blue-500 to-blue-600 text-blue-50",
            onClick: () => navigate('/doctor/appointments')
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
            title: "Profilo Professionale",
            description: "Gestisci le tue informazioni professionali, specializzazioni e sedi di lavoro.",
            buttonText: "Modifica profilo",
            gradient: "from-emerald-500 to-emerald-600 text-emerald-50",
            onClick: handleProfileClick
        },
        {
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
            title: "Cartelle Cliniche",
            description: "Accedi e gestisci le cartelle cliniche dei tuoi pazienti in modo sicuro e organizzato.",
            buttonText: "Visualizza cartelle",
            gradient: "from-violet-500 to-violet-600 text-violet-50",
            onClick: () => navigate('/doctor/patients')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-20 relative overflow-hidden">
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
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900 mb-6 sm:mb-8 leading-tight"
                    >
                        Benvenuto nella tua{' '}
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
                            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800"
                        >
                            Area Medica
                        </motion.span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="text-lg sm:text-xl text-blue-700 max-w-3xl mx-auto leading-relaxed px-4"
                    >
                        Gestisci appuntamenti, cartelle cliniche e il tuo profilo professionale in un unico posto.
                        Tutto ciò di cui hai bisogno per la tua pratica medica.
                    </motion.p>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-20 sm:pt-2 sm:pb-30">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full"
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